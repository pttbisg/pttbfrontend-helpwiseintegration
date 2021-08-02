/**
 * @typedef HelpWiseConversationObject
 * @property id
 * @property mailboxId
 * @property assignedTo
 * @property closedBy
 * @property isResolved
 * @property isSpam
 * @property isTrash
 * @property tickedId
 * @property emails
 */

/**
 * @typedef HelpWiseWhatsAppObject
 * @property id
 * @property threadId
 * @property mailboxID
 * @property body
 * @property hwNumber
 * @property clientNumber
 * @property direction
 * @property strTime
 * @property contactId
 */
class HelpWise {

    /**
     *
     * @param {HelpWiseConversationObject} conversationObject
     * @returns {Promise<void>}
     */
    async onConversationCreated(conversationObject) {
        console.log('Conversation Created', conversationObject);
    }

    async onConversationAssigned(conversationObject) {
        console.log('Conversation Assigned', conversationObject);
    }

    async onConversationDeleted() {
        //TODO
    }

    async onConversationClosed() {
        //TODO
    }

    async onConversationReopened() {
        //TODO
    }

    async onConversationNoteAdded() {
        //TODO
    }

    async onConversationTagApplied() {
        //TODO
    }

    async onReplyFromAgent() {
        //TODO
    }

    async onReplyFromCustomer() {
        //TODO
    }

    /**
     *
     * @param {HelpWiseWhatsAppObject} whatsappConversationObject
     * @returns {Promise<void>}
     */
    async onWhatsAppInboundMessage(whatsappConversationObject) {
        console.log('Whatsapp Inbound', whatsappConversationObject);
    }

    /**
     *
     * @param {HelpWiseWhatsAppObject} whatsappConversationObject
     * @returns {Promise<void>}
     */
    async onWhatsAppOutboundMessage(whatsappConversationObject) {
        console.log('Whatsapp Outbound', whatsappConversationObject);
    }
}

module.exports = HelpWise;
