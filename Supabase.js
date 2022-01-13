require('dotenv').config();
const {
	SUPABASE_DATABASE_URL,
	SUPABASE_SERVICE_API_KEY
} = process.env;

// Connect to our database 
const { createClient } = require('@supabase/supabase-js');

/**
 * @typedef {string} ConversationObject
 * @property {String} id
 * @property sender
 * @property receiver
 * @property message_type
 * @property message_body
 * @property message_direction
 * @property message_id
 * @property mailbox_id
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

class Supabase {
  constructor() {
    this.supabase = createClient(SUPABASE_DATABASE_URL, SUPABASE_SERVICE_API_KEY);
  }

  async _insertDataIntoBackendless(conversationObject) {
    try {
      const { data, error } = await this.supabase
        .from('helpwise_conversations')
        .upsert(conversationObject, { ignoreDuplicates: true, returning: 'minimal' })
      
      if (error) {
        console.log(error);
      }

      console.log(data);
    } catch (e) {
        console.log(e);
    }
  }

  async findConversationByTag() {
    const groupedByTag = {};
    const { data: conversations, error } = await this.supabase
        .from('helpwise_conversations')
        .select('*')
        .is('ready_to_release', true)
        .not('tag', 'is', 'null')
      
      if (error) {
        console.log(error);
      }
    
    for (const message of conversations) {
        const {tag, conversation_id} = message
        if (!groupedByTag.hasOwnProperty(tag)) {
            groupedByTag[tag] = {};
        }

        if (!groupedByTag[tag].hasOwnProperty(conversation_id)) {
            groupedByTag[tag][conversation_id] = [];
        }

        if(message.message_type === 'EMAIL') {
            if( message.receiver === process.env.HELPWISE_EMAIL_ACCOUNT) {
                message.message_direction = 'Inbound'
            }else {
                message.message_direction = 'Outbound'
            }
        }

        groupedByTag[tag][conversation_id].push(message);
    }

    console.log(groupedByTag)
    return groupedByTag;
  }

  /**
   * Updates the tag on the conversations
   * @param {string} id
   * @param {string} tag
   * @returns Promise<String>
   */
  async updateConversationTag(id, tag, meta= {}) {
    try {
      const { data, error } = await this.supabase
        .from('helpwise_conversations')
        .update({ tag: tag, updated_at: meta.date })
        .match({ id: id })
      
      if (error) {
        console.log(error);
      }
    } catch (e) {
        console.log(e);
    }
  }

  transformWhatsappConversation(helpwiseWhatsappObject) {
    const {client_number, body, direction, mailboxID, id, threadID} = helpwiseWhatsappObject;
    return {
        'conversation_id': threadID,
        'sender': client_number,
        'receiver': '',
        'message_type': 'WHATSAPP',
        'message_body': body,
        'message_direction': direction,
        'message_id': id,
        'mailbox_id': mailboxID,
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
            'conversation_id': id,
            'sender': email.from[0].email,
            'receiver': email.to[0].email,
            'message_type': 'EMAIL',
            'message_body': email.html,
            'message_direction': '',
            'message_id': email.id,
            'mailbox_id': mailbox_id,
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

module.exports = Supabase;
