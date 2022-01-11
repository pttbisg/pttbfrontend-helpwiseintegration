const Supabase = require('./Supabase');
const supabase = new Supabase();
const axios = require('axios');

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
        await supabase.insertEmailConversationIntoBE(conversationObject);
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

    async onConversationTagApplied(conversationObject) {
        console.log('Conversation Tag Applied', conversationObject);
        const {tag, mailbox_id, thread_id, date} = conversationObject;
        await supabase.updateConversationTag(thread_id, tag.name.toLowerCase(), {
            updatedAt: date,
            mailboxId: mailbox_id
        });
    }

    async onReplyFromAgent(conversationObject) {
        console.log('Agent Replied', conversationObject);
    }

    async onReplyFromCustomer(conversationObject) {
        console.log('Customer Replied', conversationObject);
        await supabase.insertEmailConversationIntoBE(conversationObject);
    }

    /**
     *
     * @param {HelpWiseWhatsAppObject} whatsappConversationObject
     * @returns {Promise<void>}
     */
    async onWhatsAppInboundMessage(whatsappConversationObject) {
        console.log('Whatsapp Inbound', whatsappConversationObject);
        await supabase.insertWhatsappConversationDataIntoBE(whatsappConversationObject);
    }

    /**
     *
     * @param {HelpWiseWhatsAppObject} whatsappConversationObject
     * @returns {Promise<void>}
     */
    async onWhatsAppOutboundMessage(whatsappConversationObject) {
        console.log('Whatsapp Outbound', whatsappConversationObject);
        await supabase.insertWhatsappConversationDataIntoBE(whatsappConversationObject);
    }

    /**
     *
     * @param sendMessageObject
     * @param {Array} sendMessageObject.numbers
     * @param {String} sendMessageObject.messageText
     * @returns {Promise<*[]>}
     */
    async sendMessagesViaWhatsapp(sendMessageObject) {
        console.log("Sending messages via Whatsapp", sendMessageObject);
        const results = [];
        for (const number of sendMessageObject.numbers) {

            const data = {
                "mailbox_id": process.env.HELP_WHATSAPP_MAILBOX_ID,
                "to": number.toString(),
                "message": sendMessageObject.messageText
            };

            console.log("Sending message to", number.toString());
            const response = await axios.post('https://app.helpwise.io/dev-apis/whatsapp/send', data, {
                headers: {
                    "Accept": "application/json",
                    "Authorization": `${process.env.HELPWISE_KEY}:${process.env.HELPWISE_SECRET}`
                }
            });
            results.push(response.data);
        }
        return results;
    }
}

module.exports = HelpWise;
