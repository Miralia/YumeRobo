/**
 * Global Temporary File Manager
 * Handles cleanup of temporary files on exit or interrupt
 */
import fs from 'node:fs/promises';
import { unlinkSync } from 'node:fs';

class TempFileManager {
    private files: Set<string> = new Set();
    private isCleaning: boolean = false;
    private listenersRegistered: boolean = false;

    /**
     * Register the process-level handlers. Called explicitly so importing this
     * module never installs global listeners as a side effect.
     */
    register(): void {
        if (this.listenersRegistered) return;
        this.listenersRegistered = true;

        // Normal exit: only synchronous work is possible here.
        process.on('exit', () => this.cleanupSync());

        process.on('SIGINT', () => {
            console.log('\n[!] Interrupted (Ctrl+C)');
            this.cleanup().finally(() => process.exit(130));
        });

        process.on('SIGTERM', () => {
            this.cleanup().finally(() => process.exit(143));
        });

        process.on('uncaughtException', (err) => {
            console.error('\n[!] Uncaught Exception:', err);
            this.cleanup().finally(() => process.exit(1));
        });

        process.on('unhandledRejection', (reason) => {
            console.error('\n[!] Unhandled Rejection:', reason);
            this.cleanup().finally(() => process.exit(1));
        });
    }

    /**
     * Register a file for cleanup
     */
    add(filePath: string) {
        this.files.add(filePath);
    }

    /**
     * Manually remove a file (if finished early)
     */
    async remove(filePath: string) {
        if (!this.files.has(filePath)) return;

        try {
            await fs.unlink(filePath);
        } catch (error) {
            const err = error as NodeJS.ErrnoException;
            if (err.code !== 'ENOENT') {
                // Keep the entry registered so the exit handler can retry
                // instead of forgetting the file.
                console.error(`[!] Failed to delete ${filePath}:`, error);
                return;
            }
        }
        this.files.delete(filePath);
    }

    /**
     * Cleanup all registered files (Async)
     */
    async cleanup() {
        if (this.isCleaning) return;
        this.isCleaning = true;

        try {
            if (this.files.size === 0) return;

            console.log('\n[i] Cleaning up temporary files...');
            // Snapshot first: `remove()` can mutate the set while we await.
            for (const file of [...this.files]) {
                try {
                    await fs.unlink(file);
                    this.files.delete(file);
                    console.log(`[x] Deleted: ${file}`);
                } catch (error) {
                    const err = error as NodeJS.ErrnoException;
                    if (err.code === 'ENOENT') {
                        this.files.delete(file);
                        continue;
                    }
                    console.error(`[!] Failed to delete ${file}:`, error);
                }
            }
        } finally {
            // Allow a later pass to retry whatever failed.
            this.isCleaning = false;
        }
    }

    /**
     * Synchronous cleanup for the `exit` event, which cannot await.
     */
    private cleanupSync() {
        for (const file of this.files) {
            try {
                unlinkSync(file);
            } catch {
                // Best effort: the process is already terminating.
            }
        }
        this.files.clear();
    }
}

export const tempManager = new TempFileManager();
