require('dotenv').config();
const backendless = require('backendless');

/**
 * @typedef {string} ConversationObject
 * @property {String} conversationId
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
     * @param property
     * @param value
     * @param operator
     * @return {Promise<null|Array<object>>}
     * @private
     */
    async _findObjectByProperty(property, value, operator) {
        try {
            const whereClause = `${property} ${operator} ${value}`;
            const queryBuilder = backendless.DataQueryBuilder.create().setWhereClause(whereClause);
            return backendless.Data.of(process.env.HELPWISE_CONVERSATION_TABLE).find(queryBuilder);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     *
     * @param {ConversationObject} conversationObject
     * @returns {Promise<{messageDirection: string, messageType: string, messageBody: string}>}
     * @private
     */
    async _insertDataIntoBackendless(conversationObject) {
        try {
            const records = await this._findObjectByProperty('messageId', conversationObject.messageId, '=');
            if (records.length === 0) {
                return backendless.Data
                    .of(process.env.HELPWISE_CONVERSATION_TABLE)
                    .save(conversationObject)
                    .catch((e) => {
                        console.log('BE Insert Error', e);
                    })
            } else {
                console.log('Insert into BE', 'Record Already exists', conversationObject.messageId);
            }
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Updates the tag on the conversations
     * @param {string} conversationId
     * @param {string} tag
     * @returns Promise<String>
     */
    async updateConversationTag(conversationId, tag, meta= {}) {
        const whereClause = `conversationId = ${conversationId}`;
        const dataToUpdate = {
            tag: tag,
            updated: meta.date
        }
        try {
            return backendless.Data.of( process.env.HELPWISE_CONVERSATION_TABLE )
                .bulkUpdate( whereClause, dataToUpdate);
        } catch (e) {
            console.log( "Server reported an error " + e );
        }
    }

    /**
     * Transforms the helpwise whatsapp object into backendless compatible schema.
     * @param {HelpWiseWhatsappObject} helpwiseWhatsappObject
     * @return ConversationObject
     */
    transformWhatsappConversation(helpwiseWhatsappObject) {
        const {client_number, body, direction, mailboxID, id, threadID} = helpwiseWhatsappObject;
        return {
            'conversationId': threadID,
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
     * @param helpwiseEmailObject
     * @return Array<ConversationObject>
     */
    transformEmailConversation(helpwiseEmailObject) {
        const {id, mailbox_id, emails} = helpwiseEmailObject;
        return Object.values(emails).map((email) => {
            return {
                'conversationId': id,
                'sender': email.from[0].email,
                'receiver': email.to[0].email,
                'messageType': 'EMAIL',
                'messageBody': email.html,
                'messageDirection': '',
                'messageId': email.id,
                'mailboxId': mailbox_id,
                'status': ''
            }
        })
    }

    /**
     *
     * @param {HelpWiseWhatsAppObject} whatsAppConversationObject
     */
    insertWhatsappConversationDataIntoBE(whatsAppConversationObject) {
        const convertedObject = this.transformWhatsappConversation(whatsAppConversationObject);
        console.log({convertedObject});
        return this._insertDataIntoBackendless(convertedObject);
    }

    /**
     *
     * @param conversationObject
     */
    async insertEmailConversationIntoBE(conversationObject) {
        const emailConversationObjectArray = this.transformEmailConversation(conversationObject);
        console.log('Total emails in conversation', emailConversationObjectArray.length);
        for (const emailConversationObject of emailConversationObjectArray) {
            await this._insertDataIntoBackendless(emailConversationObject);
        }
    }

}


module.exports = Backendless;
