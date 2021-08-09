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
    console.log({event});
    const parsedBody = JSON.parse(event.body);

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
