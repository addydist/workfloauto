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
        const formData = {
            formId: body.formId,
            formTitle: body.formTitle,
            responseId: body.responseId,
            timestamp: body.timestamp,
            respondentEmail: body.respondentEmail,
            responses: body.responses,
            raw: body,
        }

        await sendWorkflowExecutionEvent({
            workflowId,
            initialData:{
                gooleForm:formData,
            } 
        });
        
    }catch(error){
        console.error("Error handling Google Form trigger:", error);
        return NextResponse.json({succes:false, error: "Failed to process Google Form trigger" }, { status: 500 });
    };
}