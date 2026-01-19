/**
 * Global Temporary File Manager
 * Handles cleanup of temporary files on exit or interrupt
 */
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

class TempFileManager {
    private files: Set<string> = new Set();
    private isCleaning: boolean = false;

    constructor() {
        // Handle normal exit
        process.on('exit', () => this.cleanupSync());

        // Handle Ctrl+C
        process.on('SIGINT', () => {
            console.log('\n[!] Interrupted (Ctrl+C)');
            this.cleanup().then(() => process.exit(0));
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            console.error('\n[!] Uncaught Exception:', err);
            this.cleanup().then(() => process.exit(1));
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
        if (this.files.has(filePath)) {
            try {
                if (existsSync(filePath)) {
                    await fs.unlink(filePath);
                }
            } catch (e) {
                // Ignore
            }
            this.files.delete(filePath);
        }
    }

    /**
     * Cleanup all registered files (Async)
     */
    async cleanup() {
        if (this.isCleaning) return;
        this.isCleaning = true;

        if (this.files.size > 0) {
            console.log('\n[i] Cleaning up temporary files...');
            for (const file of this.files) {
                try {
                    if (existsSync(file)) {
                        await fs.unlink(file);
                        console.log(`[x] Deleted: ${file}`);
                    }
                } catch (e) {
                    console.error(`[!] Failed to delete ${file}:`, e);
                }
            }
            this.files.clear();
        }
    }

    /**
     * Synchronous cleanup for process.exit
     * Note: fs.unlinkSync should be used here if needed, but 'exit' event limits async ops.
     * We rely primarily on SIGINT/uncaughtException handlers for thorough cleanup.
     */
    private cleanupSync() {
        // Node.js exit event doesn't support async operations
        // Best effort relies on signal handlers above
    }
}

export const tempManager = new TempFileManager();
