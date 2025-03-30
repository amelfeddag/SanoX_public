import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core';
import Oas from 'oas';
import APICore from 'api/dist/core';
declare class SDK {
    spec: Oas;
    core: APICore;
    constructor();
    /**
     * Optionally configure various options that the SDK allows.
     *
     * @param config Object of supported SDK options and toggles.
     * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
     * should be represented in milliseconds.
     */
    config(config: ConfigOptions): void;
    /**
     * If the API you're using requires authentication you can supply the required credentials
     * through this method and the library will magically determine how they should be used
     * within your API request.
     *
     * With the exception of OpenID and MutualTLS, it supports all forms of authentication
     * supported by the OpenAPI specification.
     *
     * @example <caption>HTTP Basic auth</caption>
     * sdk.auth('username', 'password');
     *
     * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
     * sdk.auth('myBearerToken');
     *
     * @example <caption>API Keys</caption>
     * sdk.auth('myApiKey');
     *
     * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
     * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
     * @param values Your auth credentials for the API; can specify up to two strings or numbers.
     */
    auth(...values: string[] | number[]): this;
    /**
     * If the API you're using offers alternate server URLs, and server variables, you can tell
     * the SDK which one to use with this method. To use it you can supply either one of the
     * server URLs that are contained within the OpenAPI definition (along with any server
     * variables), or you can pass it a fully qualified URL to use (that may or may not exist
     * within the OpenAPI definition).
     *
     * @example <caption>Server URL with server variables</caption>
     * sdk.server('https://{region}.api.example.com/{basePath}', {
     *   name: 'eu',
     *   basePath: 'v14',
     * });
     *
     * @example <caption>Fully qualified server URL</caption>
     * sdk.server('https://eu.api.example.com/v14');
     *
     * @param url Server URL
     * @param variables An object of variables to replace into the server URL.
     */
    server(url: string, variables?: {}): void;
    /**
     * List Alerts
     *
     */
    getAlerts(metadata?: types.GetAlertsMetadataParam): Promise<FetchResponse<200, types.GetAlertsResponse200>>;
    /**
     * Create an Alert
     *
     */
    postAlerts(body: types.PostAlertsBodyParam, metadata?: types.PostAlertsMetadataParam): Promise<FetchResponse<200, types.PostAlertsResponse200>>;
    /**
     * Retrieve an Alert
     *
     */
    getAlertsId(metadata: types.GetAlertsIdMetadataParam): Promise<FetchResponse<200, types.GetAlertsIdResponse200>>;
    /**
     * Update an Alert
     *
     */
    putAlertsId(body: types.PutAlertsIdBodyParam, metadata: types.PutAlertsIdMetadataParam): Promise<FetchResponse<200, types.PutAlertsIdResponse200>>;
    putAlertsId(metadata: types.PutAlertsIdMetadataParam): Promise<FetchResponse<200, types.PutAlertsIdResponse200>>;
    /**
     * Delete an Alert
     *
     */
    deleteAlertsId(metadata: types.DeleteAlertsIdMetadataParam): Promise<FetchResponse<204, types.DeleteAlertsIdResponse204>>;
    /**
     * List Insights
     *
     */
    getInsights(metadata?: types.GetInsightsMetadataParam): Promise<FetchResponse<200, types.GetInsightsResponse200>>;
    /**
     * Create an Insight
     *
     */
    postInsights(body: types.PostInsightsBodyParam, metadata?: types.PostInsightsMetadataParam): Promise<FetchResponse<201, types.PostInsightsResponse201>>;
    /**
     * Retrieve an Insight
     *
     */
    getInsightsId(metadata: types.GetInsightsIdMetadataParam): Promise<FetchResponse<200, types.GetInsightsIdResponse200>>;
    /**
     * Update an Insight
     *
     */
    putInsightsId(body: types.PutInsightsIdBodyParam, metadata: types.PutInsightsIdMetadataParam): Promise<FetchResponse<200, types.PutInsightsIdResponse200>>;
    putInsightsId(metadata: types.PutInsightsIdMetadataParam): Promise<FetchResponse<200, types.PutInsightsIdResponse200>>;
    /**
     * Delete an Insight
     *
     */
    deleteInsightsId(metadata: types.DeleteInsightsIdMetadataParam): Promise<FetchResponse<204, types.DeleteInsightsIdResponse204>>;
    /**
     * Retrieve a Location
     *
     */
    getLocationsId(metadata: types.GetLocationsIdMetadataParam): Promise<FetchResponse<200, types.GetLocationsIdResponse200>>;
    /**
     * Delete a Location
     *
     */
    deleteLocationsId(metadata: types.DeleteLocationsIdMetadataParam): Promise<FetchResponse<204, types.DeleteLocationsIdResponse204>>;
    /**
     * Update a Location
     *
     */
    putLocationId(body: types.PutLocationIdBodyParam, metadata: types.PutLocationIdMetadataParam): Promise<FetchResponse<200, types.PutLocationIdResponse200>>;
    putLocationId(metadata: types.PutLocationIdMetadataParam): Promise<FetchResponse<200, types.PutLocationIdResponse200>>;
    /**
     * Create a Location
     *
     */
    postLocations(body: types.PostLocationsBodyParam, metadata?: types.PostLocationsMetadataParam): Promise<FetchResponse<200, types.PostLocationsResponse200>>;
    /**
     * List Locations
     *
     */
    getLocations(metadata?: types.GetLocationsMetadataParam): Promise<FetchResponse<200, types.GetLocationsResponse200>>;
    /**
     * Activate an Alert
     *
     */
    postAlertsIdActivate(metadata: types.PostAlertsIdActivateMetadataParam): Promise<FetchResponse<204, types.PostAlertsIdActivateResponse204>>;
    /**
     * Unlink Locations
     *
     */
    postAlertsIdLocationsUnlink(body: types.PostAlertsIdLocationsUnlinkBodyParam, metadata: types.PostAlertsIdLocationsUnlinkMetadataParam): Promise<FetchResponse<204, types.PostAlertsIdLocationsUnlinkResponse204>>;
    /**
     * Linked Locations
     *
     */
    postAlertsIdLocations(metadata: types.PostAlertsIdLocationsMetadataParam): Promise<FetchResponse<200, types.PostAlertsIdLocationsResponse200>>;
    /**
     * Deactivate an Alert
     *
     */
    postAlertsIdDeactivate(metadata: types.PostAlertsIdDeactivateMetadataParam): Promise<FetchResponse<204, types.PostAlertsIdDeactivateResponse204>>;
    /**
     * Link Locations
     *
     */
    postAlertsIdLocationsLink(body: types.PostAlertsIdLocationsLinkBodyParam, metadata: types.PostAlertsIdLocationsLinkMetadataParam): Promise<FetchResponse<204, types.PostAlertsIdLocationsLinkResponse204>>;
    /**
     * Retrieve Events (Basic)
     *
     */
    getEvents(metadata: types.GetEventsMetadataParam): Promise<FetchResponse<200, types.GetEventsResponse200>>;
    /**
     * Retrieve Events (Advanced)
     *
     */
    postEvents(body: types.PostEventsBodyParam, metadata?: types.PostEventsMetadataParam): Promise<FetchResponse<200, types.PostEventsResponse200>>;
    /**
     * Remove Location Tags
     *
     * @throws FetchError<400, types.RemoveLocationTagsResponse400> 400
     */
    removeLocationTags(body: types.RemoveLocationTagsBodyParam, metadata?: types.RemoveLocationTagsMetadataParam): Promise<FetchResponse<204, types.RemoveLocationTagsResponse204>>;
    /**
     * List Notifications
     *
     */
    listNotificationsGet(metadata?: types.ListNotificationsGetMetadataParam): Promise<FetchResponse<200, types.ListNotificationsGetResponse200>>;
    /**
     * Remove Insight Tags
     *
     * @throws FetchError<400, types.RemoveInsightTagsResponse400> 400
     */
    removeInsightTags(body: types.RemoveInsightTagsBodyParam, metadata?: types.RemoveInsightTagsMetadataParam): Promise<FetchResponse<204, types.RemoveInsightTagsResponse204>>;
    /**
     * Add Insight Tags
     *
     * @throws FetchError<400, types.AddInsightTagsResponse400> 400
     */
    addInsightTags(body: types.AddInsightTagsBodyParam, metadata?: types.AddInsightTagsMetadataParam): Promise<FetchResponse<204, types.AddInsightTagsResponse204>>;
    /**
     * Add Location Tags
     *
     * @throws FetchError<400, types.AddLocationTagsResponse400> 400
     */
    addLocationTags(body: types.AddLocationTagsBodyParam, metadata?: types.AddLocationTagsMetadataParam): Promise<FetchResponse<204, types.AddLocationTagsResponse204>>;
    /**
     * On-Demand Events
     *
     * @throws FetchError<400, types.EventsTimelineResponse400> 400
     */
    eventsTimeline(body: types.EventsTimelineBodyParam): Promise<FetchResponse<200, types.EventsTimelineResponse200>>;
}
declare const createSDK: SDK;
export = createSDK;
