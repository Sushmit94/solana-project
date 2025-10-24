"use strict";
// mailchain-service/src/mailchain-client.ts
// Handles fetching emails from Mailchain network
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailchainClient = void 0;
exports.createMailchainClient = createMailchainClient;
const Mailchain = __importStar(require("@mailchain/sdk"));
class MailchainClient {
    constructor(config) {
        this.address = null;
        this.client = Mailchain.Mailchain.fromSecretRecoveryPhrase(config.secretRecoveryPhrase || '');
    }
    /**
     * Initialize and get user's Mailchain address
     */
    async initialize() {
        try {
            const addresses = await this.client.user().addresses();
            if (!addresses || addresses.length === 0) {
                throw new Error('No Mailchain addresses found');
            }
            this.address = addresses[0];
            console.log('✅ Mailchain initialized:', this.address);
            return this.address ?? '';
        }
        catch (error) {
            console.error('Failed to initialize Mailchain:', error);
            throw error;
        }
    }
    /**
     * Fetch all emails from inbox
     */
    async fetchInbox(limit = 50) {
        if (!this.address) {
            throw new Error('Mailchain not initialized. Call initialize() first.');
        }
        try {
            const messages = await this.client.messages().list({
                address: this.address,
                limit,
            });
            return messages.map((msg) => ({
                id: msg.id || '',
                from: msg.from || '',
                to: msg.to?.[0] || '',
                subject: msg.subject || '',
                body: msg.body || '',
                timestamp: new Date(msg.date || Date.now()).getTime(),
                headers: msg.headers || {},
                attachments: msg.attachments?.map((att) => ({
                    filename: att.filename || 'unknown',
                    contentType: att.contentType || 'application/octet-stream',
                    size: att.size || 0,
                })),
            }));
        }
        catch (error) {
            console.error('Failed to fetch inbox:', error);
            throw error;
        }
    }
    /**
     * Fetch a specific email by ID
     */
    async fetchEmail(messageId) {
        if (!this.address) {
            throw new Error('Mailchain not initialized');
        }
        try {
            const msg = await this.client.messages().get({
                address: this.address,
                messageId,
            });
            if (!msg)
                return null;
            return {
                id: msg.id || '',
                from: msg.from || '',
                to: msg.to?.[0] || '',
                subject: msg.subject || '',
                body: msg.body || '',
                timestamp: new Date(msg.date || Date.now()).getTime(),
                headers: msg.headers || {},
                attachments: msg.attachments?.map((att) => ({
                    filename: att.filename || 'unknown',
                    contentType: att.contentType || 'application/octet-stream',
                    size: att.size || 0,
                })),
            };
        }
        catch (error) {
            console.error('Failed to fetch email:', error);
            return null;
        }
    }
    /**
     * Send an email via Mailchain
     */
    async sendEmail(to, subject, body) {
        if (!this.address) {
            throw new Error('Mailchain not initialized');
        }
        try {
            await this.client.messages().send({
                from: this.address,
                to: [to],
                subject,
                content: {
                    text: body,
                    html: body,
                },
            });
            console.log('✅ Email sent successfully');
            return true;
        }
        catch (error) {
            console.error('Failed to send email:', error);
            return false;
        }
    }
    /**
     * Mark email as read
     */
    async markAsRead(messageId) {
        try {
            await this.client.messages().markAsRead({
                address: this.address,
                messageId,
            });
            return true;
        }
        catch (error) {
            console.error('Failed to mark as read:', error);
            return false;
        }
    }
    /**
     * Get user's Mailchain address
     */
    getAddress() {
        return this.address;
    }
}
exports.MailchainClient = MailchainClient;
/**
 * Factory function for easy client creation
 */
function createMailchainClient(config) {
    return new MailchainClient(config);
}
//# sourceMappingURL=mailchain-client.js.map