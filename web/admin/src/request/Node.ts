/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import httpRequest, { ContentType, RequestParams } from "./httpClient";
import {
  DomainBatchMoveReq,
  DomainCreateNodeReq,
  DomainMoveNodeReq,
  DomainNodeActionReq,
  DomainNodeDetailResp,
  DomainNodeListItemResp,
  DomainNodeSummaryReq,
  DomainRecommendNodeListResp,
  DomainResponse,
  DomainUpdateNodeReq,
  GetApiV1NodeDetailParams,
  GetApiV1NodeListParams,
  GetApiV1NodeRecommendNodesParams,
} from "./types";

/**
 * @description Create Node
 *
 * @tags node
 * @name PostApiV1Node
 * @summary Create Node
 * @request POST:/api/v1/node
 * @response `200` `(DomainResponse & {
    data?: Record<string, any>,

})` OK
 */

export const postApiV1Node = (
  body: DomainCreateNodeReq,
  params: RequestParams = {},
) =>
  httpRequest<
    DomainResponse & {
      data?: Record<string, any>;
    }
  >({
    path: `/api/v1/node`,
    method: "POST",
    body: body,
    type: ContentType.Json,
    format: "json",
    ...params,
  });

/**
 * @description Node Action
 *
 * @tags node
 * @name PostApiV1NodeAction
 * @summary Node Action
 * @request POST:/api/v1/node/action
 * @response `200` `(DomainResponse & {
    data?: Record<string, any>,

})` OK
 */

export const postApiV1NodeAction = (
  action: DomainNodeActionReq,
  params: RequestParams = {},
) =>
  httpRequest<
    DomainResponse & {
      data?: Record<string, any>;
    }
  >({
    path: `/api/v1/node/action`,
    method: "POST",
    body: action,
    type: ContentType.Json,
    format: "json",
    ...params,
  });

/**
 * @description Batch Move Node
 *
 * @tags node
 * @name PostApiV1NodeBatchMove
 * @summary Batch Move Node
 * @request POST:/api/v1/node/batch_move
 * @response `200` `DomainResponse` OK
 */

export const postApiV1NodeBatchMove = (
  body: DomainBatchMoveReq,
  params: RequestParams = {},
) =>
  httpRequest<DomainResponse>({
    path: `/api/v1/node/batch_move`,
    method: "POST",
    body: body,
    type: ContentType.Json,
    format: "json",
    ...params,
  });

/**
 * @description Get Node Detail
 *
 * @tags node
 * @name GetApiV1NodeDetail
 * @summary Get Node Detail
 * @request GET:/api/v1/node/detail
 * @response `200` `(DomainResponse & {
    data?: DomainNodeDetailResp,

})` OK
 */

export const getApiV1NodeDetail = (
  query: GetApiV1NodeDetailParams,
  params: RequestParams = {},
) =>
  httpRequest<
    DomainResponse & {
      data?: DomainNodeDetailResp;
    }
  >({
    path: `/api/v1/node/detail`,
    method: "GET",
    query: query,
    type: ContentType.Json,
    format: "json",
    ...params,
  });

/**
 * @description Update Node Detail
 *
 * @tags node
 * @name PutApiV1NodeDetail
 * @summary Update Node Detail
 * @request PUT:/api/v1/node/detail
 * @response `200` `DomainResponse` OK
 */

export const putApiV1NodeDetail = (
  body: DomainUpdateNodeReq,
  params: RequestParams = {},
) =>
  httpRequest<DomainResponse>({
    path: `/api/v1/node/detail`,
    method: "PUT",
    body: body,
    type: ContentType.Json,
    format: "json",
    ...params,
  });

/**
 * @description Get Node List
 *
 * @tags node
 * @name GetApiV1NodeList
 * @summary Get Node List
 * @request GET:/api/v1/node/list
 * @response `200` `(DomainResponse & {
    data?: (DomainNodeListItemResp)[],

})` OK
 */

export const getApiV1NodeList = (
  query: GetApiV1NodeListParams,
  params: RequestParams = {},
) =>
  httpRequest<
    DomainResponse & {
      data?: DomainNodeListItemResp[];
    }
  >({
    path: `/api/v1/node/list`,
    method: "GET",
    query: query,
    type: ContentType.Json,
    format: "json",
    ...params,
  });

/**
 * @description Move Node
 *
 * @tags node
 * @name PostApiV1NodeMove
 * @summary Move Node
 * @request POST:/api/v1/node/move
 * @response `200` `DomainResponse` OK
 */

export const postApiV1NodeMove = (
  body: DomainMoveNodeReq,
  params: RequestParams = {},
) =>
  httpRequest<DomainResponse>({
    path: `/api/v1/node/move`,
    method: "POST",
    body: body,
    type: ContentType.Json,
    format: "json",
    ...params,
  });

/**
 * @description Recommend Nodes
 *
 * @tags node
 * @name GetApiV1NodeRecommendNodes
 * @summary Recommend Nodes
 * @request GET:/api/v1/node/recommend_nodes
 * @response `200` `(DomainResponse & {
    data?: (DomainRecommendNodeListResp)[],

})` OK
 */

export const getApiV1NodeRecommendNodes = (
  query: GetApiV1NodeRecommendNodesParams,
  params: RequestParams = {},
) =>
  httpRequest<
    DomainResponse & {
      data?: DomainRecommendNodeListResp[];
    }
  >({
    path: `/api/v1/node/recommend_nodes`,
    method: "GET",
    query: query,
    type: ContentType.Json,
    format: "json",
    ...params,
  });

/**
 * @description Summary Node
 *
 * @tags node
 * @name PostApiV1NodeSummary
 * @summary Summary Node
 * @request POST:/api/v1/node/summary
 * @response `200` `DomainResponse` OK
 */

export const postApiV1NodeSummary = (
  body: DomainNodeSummaryReq,
  params: RequestParams = {},
) =>
  httpRequest<DomainResponse>({
    path: `/api/v1/node/summary`,
    method: "POST",
    body: body,
    type: ContentType.Json,
    format: "json",
    ...params,
  });
