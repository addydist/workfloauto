import {NodeType} from "@/generated/prisma";
import { NodeExecutor } from "../types";
import { manulTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";

export const executorRegistry: Record<NodeType,NodeExecutor> = {
    [NodeType.MANUAL_TRIGGER]:manulTriggerExecutor,
    [NodeType.HTTP_REQUEST]:httpRequestExecutor,
    [NodeType.INITIAL]:manulTriggerExecutor,

};
export const getExecutor=(type:NodeType):NodeExecutor=>{
    const executor=executorRegistry[type];
    if(!executor){
        throw new Error(`No executor found for node type: ${type}`);
    }
    return executor;
}