require('dotenv').config();
const backendless = require('backendless');

/**
 * @typedef {string} ConversationObject
 * @property sender
 * @property receiver
 * @property messageType
 * @property messageBody
 * @property messageDirection
 * @property messageId
 * @property mailboxId
 * @property status
 */

/**
 * @typedef HelpWiseWhatsappObject
 * @property id
 * @property threadID
 * @property mailboxID,
 * @property body,
 * @property hw_number,
 * @property client_number,
 * @property direction,
 * @property str_time,
 * @property contact_id,
 * @property message_type
 */

class Backendless {
    constructor() {
        backendless.initApp(process.env.BACKENDLESS_APP_ID, process.env.BACKENDLESS_SECRET_KEY);
    }

    /**
     *
     * @param {ConversationObject} conversationObject
     * @returns {Promise<{messageDirection: string, messageType: string, messageBody: string}>}
     * @private
     */
    async _insertDataIntoBackendless(conversationObject) {
        return backendless.Data
            .of(process.env.HELPWISE_CONVERSATION_TABLE)
            .save(conversationObject);
    }

    /**
     * Transforms the helpwise whatsapp object into backendless compatible schema.
     * @param {HelpWiseWhatsappObject} helpwiseWhatsappObject
     * @return ConversationObject
     */
    transformWhatsappConversation(helpwiseWhatsappObject) {
        const {client_number, body, direction, mailboxID, id} = helpwiseWhatsappObject;
        return {
            'sender': client_number,
            'receiver': '',
            'messageType': 'WHATSAPP',
            'messageBody': body,
            'messageDirection': direction,
            'messageId': id,
            'mailboxId': mailboxID,
            'status': ''
        }
    }

    /**
     *
     * @param {ConversationObject} conversationObject
     */
    insertWhatsappConversationDataIntoBE(conversationObject) {
        const convertedObject = this.transformWhatsappConversation(conversationObject);
        console.log({convertedObject});
        return this._insertDataIntoBackendless(convertedObject);
    }

}


module.exports = Backendless;
