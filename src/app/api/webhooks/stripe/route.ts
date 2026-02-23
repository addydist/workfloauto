import { sendWorkflowExecutionEvent } from "@/inngest/utils";
import { time } from "console";
import { type NextRequest, NextResponse } from "next/server";   
export async function POST(request: NextRequest) {
    try{
        const url=new URL(request.url);
        const workflowId = url.searchParams.get("workflowId");
        if(!workflowId){
            return NextResponse.json({success:false, error: "Missing workflowId"},{status:400});
        }
        const body = await request.json();
        const stripeData = {
           eventId: body.eventId,
           eventType: body.type,
           timestamp: body.created,
           livemode: body.livemode,
           raw:body?.data?.object,
        }

        await sendWorkflowExecutionEvent({
            workflowId,
            initialData:{
                stripe:stripeData,
            } 
        });
        return NextResponse.json({success:true}, {status:200});
    }catch(error){
        console.error("Error handling Stripe trigger:", error);
        return NextResponse.json({succes:false, error: "Failed to process Google Form trigger" }, { status: 500 });
    };
}