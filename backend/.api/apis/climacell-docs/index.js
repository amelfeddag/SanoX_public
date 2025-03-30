"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var oas_1 = __importDefault(require("oas"));
var core_1 = __importDefault(require("api/dist/core"));
var openapi_json_1 = __importDefault(require("./openapi.json"));
var SDK = /** @class */ (function () {
    function SDK() {
        this.spec = oas_1.default.init(openapi_json_1.default);
        this.core = new core_1.default(this.spec, 'climacell-docs/unknown (api/6.1.1)');
    }
    /**
     * Optionally configure various options that the SDK allows.
     *
     * @param config Object of supported SDK options and toggles.
     * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
     * should be represented in milliseconds.
     */
    SDK.prototype.config = function (config) {
        this.core.setConfig(config);
    };
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
    SDK.prototype.auth = function () {
        var _a;
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        (_a = this.core).setAuth.apply(_a, values);
        return this;
    };
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
    SDK.prototype.server = function (url, variables) {
        if (variables === void 0) { variables = {}; }
        this.core.setServer(url, variables);
    };
    /**
     * List Alerts
     *
     */
    SDK.prototype.getAlerts = function (metadata) {
        return this.core.fetch('/alerts', 'get', metadata);
    };
    /**
     * Create an Alert
     *
     */
    SDK.prototype.postAlerts = function (body, metadata) {
        return this.core.fetch('/alerts', 'post', body, metadata);
    };
    /**
     * Retrieve an Alert
     *
     */
    SDK.prototype.getAlertsId = function (metadata) {
        return this.core.fetch('/alerts/{alertId}', 'get', metadata);
    };
    SDK.prototype.putAlertsId = function (body, metadata) {
        return this.core.fetch('/alerts/{alertId}', 'put', body, metadata);
    };
    /**
     * Delete an Alert
     *
     */
    SDK.prototype.deleteAlertsId = function (metadata) {
        return this.core.fetch('/alerts/{alertId}', 'delete', metadata);
    };
    /**
     * List Insights
     *
     */
    SDK.prototype.getInsights = function (metadata) {
        return this.core.fetch('/insights', 'get', metadata);
    };
    /**
     * Create an Insight
     *
     */
    SDK.prototype.postInsights = function (body, metadata) {
        return this.core.fetch('/insights', 'post', body, metadata);
    };
    /**
     * Retrieve an Insight
     *
     */
    SDK.prototype.getInsightsId = function (metadata) {
        return this.core.fetch('/insights/{insightId}', 'get', metadata);
    };
    SDK.prototype.putInsightsId = function (body, metadata) {
        return this.core.fetch('/insights/{insightId}', 'put', body, metadata);
    };
    /**
     * Delete an Insight
     *
     */
    SDK.prototype.deleteInsightsId = function (metadata) {
        return this.core.fetch('/insights/{insightId}', 'delete', metadata);
    };
    /**
     * Retrieve a Location
     *
     */
    SDK.prototype.getLocationsId = function (metadata) {
        return this.core.fetch('/locations/{locationId}', 'get', metadata);
    };
    /**
     * Delete a Location
     *
     */
    SDK.prototype.deleteLocationsId = function (metadata) {
        return this.core.fetch('/locations/{locationId}', 'delete', metadata);
    };
    SDK.prototype.putLocationId = function (body, metadata) {
        return this.core.fetch('/locations/{locationId}', 'put', body, metadata);
    };
    /**
     * Create a Location
     *
     */
    SDK.prototype.postLocations = function (body, metadata) {
        return this.core.fetch('/locations', 'post', body, metadata);
    };
    /**
     * List Locations
     *
     */
    SDK.prototype.getLocations = function (metadata) {
        return this.core.fetch('/locations', 'get', metadata);
    };
    /**
     * Activate an Alert
     *
     */
    SDK.prototype.postAlertsIdActivate = function (metadata) {
        return this.core.fetch('/alerts/{alertId}/activate', 'post', metadata);
    };
    /**
     * Unlink Locations
     *
     */
    SDK.prototype.postAlertsIdLocationsUnlink = function (body, metadata) {
        return this.core.fetch('/alerts/{alertId}/locations/unlink', 'post', body, metadata);
    };
    /**
     * Linked Locations
     *
     */
    SDK.prototype.postAlertsIdLocations = function (metadata) {
        return this.core.fetch('/alerts/{alertId}/locations', 'get', metadata);
    };
    /**
     * Deactivate an Alert
     *
     */
    SDK.prototype.postAlertsIdDeactivate = function (metadata) {
        return this.core.fetch('/alerts/{alertId}/deactivate', 'post', metadata);
    };
    /**
     * Link Locations
     *
     */
    SDK.prototype.postAlertsIdLocationsLink = function (body, metadata) {
        return this.core.fetch('/alerts/{alertId}/locations/link', 'post', body, metadata);
    };
    /**
     * Retrieve Events (Basic)
     *
     */
    SDK.prototype.getEvents = function (metadata) {
        return this.core.fetch('/events', 'get', metadata);
    };
    /**
     * Retrieve Events (Advanced)
     *
     */
    SDK.prototype.postEvents = function (body, metadata) {
        return this.core.fetch('/events', 'post', body, metadata);
    };
    /**
     * Remove Location Tags
     *
     * @throws FetchError<400, types.RemoveLocationTagsResponse400> 400
     */
    SDK.prototype.removeLocationTags = function (body, metadata) {
        return this.core.fetch('/locations/tags/remove', 'post', body, metadata);
    };
    /**
     * List Notifications
     *
     */
    SDK.prototype.listNotificationsGet = function (metadata) {
        return this.core.fetch('/notifications', 'get', metadata);
    };
    /**
     * Remove Insight Tags
     *
     * @throws FetchError<400, types.RemoveInsightTagsResponse400> 400
     */
    SDK.prototype.removeInsightTags = function (body, metadata) {
        return this.core.fetch('/insights/tags/remove', 'post', body, metadata);
    };
    /**
     * Add Insight Tags
     *
     * @throws FetchError<400, types.AddInsightTagsResponse400> 400
     */
    SDK.prototype.addInsightTags = function (body, metadata) {
        return this.core.fetch('/insights/tags/add', 'post', body, metadata);
    };
    /**
     * Add Location Tags
     *
     * @throws FetchError<400, types.AddLocationTagsResponse400> 400
     */
    SDK.prototype.addLocationTags = function (body, metadata) {
        return this.core.fetch('/locations/tags/add', 'post', body, metadata);
    };
    /**
     * On-Demand Events
     *
     * @throws FetchError<400, types.EventsTimelineResponse400> 400
     */
    SDK.prototype.eventsTimeline = function (body) {
        return this.core.fetch('/events-timeline', 'post', body);
    };
    return SDK;
}());
var createSDK = (function () { return new SDK(); })();
module.exports = createSDK;
