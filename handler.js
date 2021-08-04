'use strict';
const HelpWise = require("./HelpWise");
const {
    CONVERSATION_CREATED,
    CONVERSATION_ASSIGNED,
    CONVERSATION_APPLIED_TAG,
    AGENT_REPLIED,
    CUSTOMER_REPLIED,
    WHATSAPP_INBOUND,
    WHATSAPP_OUTBOUND
} = require("./constants");

const Backendless = require('./Backendless');
/*
Whatsapp inbound response
{
    id: 1192529,
    threadID: '923409849540',
    mailboxID: 214573,
    body: 'Api test',
    hw_number: '6531294116',
    client_number: '923409849540',
    direction: 'Inbound',
    str_time: '2021-07-31 12:14:41',
    contact_id: 9868941,
    message_type: 'WhatsApp message'
}*/

/*
Conversation Created
{
    id: 13229748,
    mailbox_id: 214012,
    tags: [],
    assigned_to: {
    assigned_by: [],
        assigned_to: [],
        time: '2021-07-31T13:55:26+0000',
        humanFriendlyDate: '23 seconds ago'
},
    closed_by: [],
        is_resolved: false,
    is_spam: false,
    is_trash: false,
    ticket_id: 13229748,
    emails: {
    '22235166': {
            id: 22439542,
            thread_id: 13229748,
            cc: [],
            to: [Array],
            from: [Array],
            bcc: [],
            date: '2021-07-31T13:55:48+0000',
            human_friendly_date: '1 second ago',
            sent_by: [Object],
            attachments: [],
            total_attachments: '0',
            reply_to: '{}',
            html: '<html><head></head><body><div style="font-family:sans-serif;font-size:0.875rem;color:#001737" class="hwEmailWrapper"><div><br></div><div>API Test Conversation</div><div><div class="hw_signature rounded"><div class="hw_attr"><div id="signature-22439542" class="pt-2 pb-2">--<br>Regards,<br>Daniel Chua</div></div></div></div></div></body></html>',
            text: '\n\nAPI Test Conversation\n--\nRegards,\nDaniel Chua'
    }
},
    subject: 'Gathering API Data'
}*/


/*
Conversation Assigned
{
    thread_id: 13229748,
    mailbox_id: 214012,
    assigned_by: {
    id: 214603,
        first_name: 'Daniel',
        last_name: 'Chua',
        email: 'ask@interstellargoods.sg',
        profile_pic: '',
        is_admin: true
},
    assigned_to: {
        id: 214603,
            first_name: 'Daniel',
            last_name: 'Chua',
            email: 'ask@interstellargoods.sg',
            profile_pic: '',
            is_admin: true
    }
}*/

module.exports.helpWiseHandler = async (event) => {
    const parsedBody = JSON.parse(event.body);
    console.log(event);

    const {action} = event.queryStringParameters;
    const secretKey = event.queryStringParameters['?secret_key'];

    if (secretKey !== process.env.HELPWISE_SECRET){
        console.log("Secret Key Mismatch", secretKey);
        return { statusCode: 400, body: "secret key mismatch"};
    }
    if (!action) return { statusCode: 400, body: "action parameter is required" };

    const helpWise = new HelpWise();
    switch (action) {
        case CONVERSATION_CREATED: {
            await helpWise.onConversationCreated(parsedBody);
            break;
        }
        case CONVERSATION_ASSIGNED: {
            await helpWise.onConversationAssigned(parsedBody);
            break;
        }
        case CONVERSATION_APPLIED_TAG: {
            await helpWise.onConversationTagApplied(parsedBody);
            break;
        }
        case AGENT_REPLIED: {
            await helpWise.onReplyFromAgent(parsedBody);
            break;
        }
        case CUSTOMER_REPLIED: {
            await helpWise.onReplyFromCustomer(parsedBody)
            break;
        }
        case WHATSAPP_INBOUND: {
            await helpWise.onWhatsAppInboundMessage(parsedBody);
            break;
        }
        case WHATSAPP_OUTBOUND: {
            await helpWise.onWhatsAppOutboundMessage(parsedBody);
            break;
        }
        default: {
            console.log('action not listed');
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'Go Serverless v2.1! Your function executed successfully!',
                input: event,
            },
            null,
            2
        ),
    };
};
