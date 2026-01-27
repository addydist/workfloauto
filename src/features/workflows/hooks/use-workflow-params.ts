import { workflowsParams } from "../params";
import { useQueryStates } from "nuqs";
export const useWorkflowParams = () => {
    return useQueryStates(workflowsParams);
};
