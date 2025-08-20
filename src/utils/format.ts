export function formatCommitMessage(message: string): string {
    return message.trim();
}

export function formatFileChange(file: string, changeType: 'added' | 'modified' | 'deleted'): string {
    return `${changeType.toUpperCase()}: ${file}`;
}