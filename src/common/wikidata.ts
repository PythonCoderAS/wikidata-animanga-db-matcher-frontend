import config from "../pages/login/config.json";
import { doAuthenticatedRequest } from "./oauth";

export enum Operation {
  createClaim,
  setClaim,
  deleteClaim,
}

export type CreateClaimOperation = {
  property: string;
  value: string;
};

export type SetClaimOperation = {
  // Claim GUID
  id: string;
  newValue: string;
};

export type DeleteClaimOperation = {
  // Claim GUID
  id: string;
};

interface ClaimOp<Type extends Operation, Data extends Record<string, string>> {
  type: Type;
  itemId: string;
  data: Data;
}

export type CreateClaimOp = ClaimOp<
  Operation.createClaim,
  CreateClaimOperation
>;
export type SetClaimOp = ClaimOp<Operation.setClaim, SetClaimOperation>;
export type DeleteClaimOp = ClaimOp<
  Operation.deleteClaim,
  DeleteClaimOperation
>;

export const wikidataAPIEndpoint = "https://www.wikidata.org/w/api.php";
export const wikidataProxyAPIEndpoint = "./wikidata/w/api.php";

async function doAPIRequest(
  params: Record<string, string>,
  post = false,
  addToken = false
) {
  const extraHeaders: Record<string, string> = {};
  let token: string | null = null;
  let doPost = post;
  let endpoint = wikidataAPIEndpoint;
  if (addToken) {
    endpoint = wikidataProxyAPIEndpoint;
    doPost = true;
    extraHeaders["Content-Type"] =
      "application/x-www-form-urlencoded; charset=utf-8";
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    token = await getCSRFToken();
  }

  const resp = await doAuthenticatedRequest(
    `${endpoint}?${new URLSearchParams({
      ...params,
      origin: config.origin,
    }).toString()}`,
    {
      method: doPost ? "POST" : "GET",
      headers: extraHeaders,
      body:
        token !== null ? new URLSearchParams({ token }).toString() : undefined,
    }
  );
  return resp.json();
}

export async function getCSRFToken(): Promise<string> {
  const params = {
    action: "query",
    format: "json",
    meta: "tokens",
    formatversion: "2",
  };
  return (await doAPIRequest(params)).query.tokens.csrftoken;
}

export async function doCreateClaim(data: CreateClaimOp): Promise<string> {
  const params = {
    action: "wbcreateclaim",
    format: "json",
    entity: data.itemId,
    snaktype: "value",
    property: data.data.property,
    value: `"${data.data.value}"`,
    summary: `Set value of [[Property:${data.data.property}]] via user selection (Animanga DB Matcher)`,
    formatversion: "2",
  };
  return (await doAPIRequest(params, true, true)).claim.id;
}

export async function doSetClaim(data: SetClaimOp): Promise<string> {
  const params = {
    action: "wbsetclaimvalue",
    format: "json",
    claim: data.data.id,
    snaktype: "value",
    value: `"${data.data.newValue}"`,
    summary: "Updating value via user selection (Animanga DB Matcher)",
    formatversion: "2",
  };
  return (await doAPIRequest(params, true, true)).claim.id;
}

export async function doDeleteClaim(data: DeleteClaimOp): Promise<string> {
  const params = {
    action: "wbremoveclaims",
    format: "json",
    claim: data.data.id,
    summary:
      "Deleting value due to multiple values for properties with single value only (Animanga DB Matcher)",
    formatversion: "2",
  };
  await doAPIRequest(params, true, true);
  return data.data.id;
}

export type Operations = CreateClaimOp | SetClaimOp | DeleteClaimOp;

export async function doOp(op: Operations): Promise<string> {
  switch (op.type) {
    case Operation.createClaim:
      return doCreateClaim(op);
    case Operation.setClaim:
      return doSetClaim(op);
    case Operation.deleteClaim:
      return doDeleteClaim(op);
    default:
      return "Error.";
  }
}
