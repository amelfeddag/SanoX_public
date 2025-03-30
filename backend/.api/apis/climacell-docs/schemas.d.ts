declare const AddInsightTags: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["insights"];
        readonly properties: {
            readonly insights: {
                readonly type: "array";
                readonly description: "List of insight IDs";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly tags: {
                readonly type: "array";
                readonly description: "List of tags to be added to insights";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "204": {
            readonly type: "object";
            readonly properties: {};
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
        readonly "400": {
            readonly type: "object";
            readonly properties: {};
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const AddLocationTags: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["locations", "tags"];
        readonly properties: {
            readonly locations: {
                readonly type: "array";
                readonly description: "List of location IDs";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly tags: {
                readonly type: "array";
                readonly description: "List of tags to be added to locations";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "204": {
            readonly type: "object";
            readonly properties: {};
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
        readonly "400": {
            readonly type: "object";
            readonly properties: {};
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const DeleteAlertsId: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly alertId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined alert";
                };
            };
            readonly required: readonly ["alertId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "204": {
            readonly type: "object";
            readonly properties: {};
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const DeleteInsightsId: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly insightId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined insight";
                };
            };
            readonly required: readonly ["insightId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "204": {
            readonly type: "object";
            readonly properties: {};
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const DeleteLocationsId: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly locationId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined location";
                };
            };
            readonly required: readonly ["locationId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "204": {
            readonly type: "object";
            readonly properties: {};
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const EventsTimeline: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["location", "insight"];
        readonly properties: {
            readonly location: {
                readonly type: "string";
                readonly description: "This either get {\"locationId\": \"ID\"} or [Geometry](https://docs.tomorrow.io/reference/locations-overview) i.e        { \"geometry\": {             \"type\": \"Point\",             \"coordinates\": [                 -73.890,                 40.768             ]         }}";
                readonly format: "json";
            };
            readonly insight: {
                readonly type: "string";
                readonly description: "This is the conditions to be met. You can either pass here [Rules](https://docs.tomorrow.io/reference/insights-overview#rules-language-recommended) i.e {\"rules\": \"(temperature > 30)\"}. [conditions](https://docs.tomorrow.io/reference/insights-overview#conditions-language-ast-trees) i.e {\"conditions\": \"...\") or InsightId, i.e. {\"insightId\": \"....\"}";
                readonly format: "json";
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly data: {
                    readonly type: "object";
                    readonly properties: {
                        readonly eventsTimeline: {
                            readonly type: "object";
                            readonly properties: {
                                readonly geometry: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly examples: readonly ["Point"];
                                        };
                                        readonly coordinates: {
                                            readonly type: "array";
                                            readonly items: {
                                                readonly type: "number";
                                                readonly default: 0;
                                                readonly examples: readonly [-73.892];
                                            };
                                        };
                                    };
                                };
                                readonly items: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly from: {
                                                readonly type: "string";
                                                readonly examples: readonly ["2023-07-24T08:00:00Z"];
                                            };
                                            readonly active: {
                                                readonly type: "boolean";
                                                readonly default: true;
                                                readonly examples: readonly [false];
                                            };
                                            readonly actualValues: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly cloudCover: {
                                                        readonly type: "integer";
                                                        readonly default: 0;
                                                        readonly examples: readonly [98];
                                                    };
                                                    readonly temperature: {
                                                        readonly type: "number";
                                                        readonly default: 0;
                                                        readonly examples: readonly [25.5];
                                                    };
                                                };
                                            };
                                            readonly actualTriggerValues: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly cloudCover: {
                                                        readonly type: "integer";
                                                        readonly default: 0;
                                                        readonly examples: readonly [98];
                                                    };
                                                    readonly temperature: {
                                                        readonly type: "number";
                                                        readonly default: 0;
                                                        readonly examples: readonly [25.5];
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                                readonly itemsStartTime: {
                                    readonly type: "string";
                                    readonly examples: readonly ["2023-07-24T08:00:00Z"];
                                };
                                readonly itemsEndTime: {
                                    readonly type: "string";
                                    readonly examples: readonly ["2023-07-29T08:00:00Z"];
                                };
                            };
                        };
                    };
                };
            };
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
        readonly "400": {
            readonly type: "object";
            readonly properties: {};
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const GetAlerts: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly data: {
                    readonly type: "object";
                    readonly properties: {
                        readonly alerts: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly id: {
                                        readonly type: "string";
                                        readonly examples: readonly ["38f689d83c264eb0b084ba095f2ea743"];
                                    };
                                    readonly insight: {
                                        readonly type: "string";
                                        readonly examples: readonly ["38f689d83c264eb0b084ba095f2ea332"];
                                    };
                                    readonly name: {
                                        readonly type: "string";
                                        readonly examples: readonly ["De-icing Conditions Alert"];
                                    };
                                    readonly isActive: {
                                        readonly type: "boolean";
                                        readonly default: true;
                                        readonly examples: readonly [true];
                                    };
                                    readonly notifications: {
                                        readonly type: "array";
                                        readonly items: {
                                            readonly type: "string";
                                            readonly examples: readonly ["...notifications"];
                                        };
                                    };
                                    readonly createdAt: {
                                        readonly type: "string";
                                        readonly examples: readonly ["2020-05-10T06:49:34+0000"];
                                    };
                                    readonly updatedAt: {
                                        readonly type: "string";
                                        readonly examples: readonly ["2020-05-11T08:22:34+0000"];
                                    };
                                };
                            };
                        };
                    };
                };
                readonly links: {
                    readonly type: "object";
                    readonly properties: {};
                };
            };
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const GetAlertsId: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly alertId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined alert";
                };
            };
            readonly required: readonly ["alertId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly data: {
                    readonly type: "object";
                    readonly properties: {
                        readonly alert: {
                            readonly type: "object";
                            readonly properties: {
                                readonly id: {
                                    readonly type: "string";
                                    readonly examples: readonly ["38f689d83c264eb0b084ba095f2ea743"];
                                };
                                readonly insight: {
                                    readonly type: "string";
                                    readonly examples: readonly ["38f689d83c264eb0b084ba095f2ea332"];
                                };
                                readonly name: {
                                    readonly type: "string";
                                    readonly examples: readonly ["De-icing Conditions Alert"];
                                };
                                readonly isActive: {
                                    readonly type: "boolean";
                                    readonly default: true;
                                    readonly examples: readonly [true];
                                };
                                readonly notifications: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                        readonly examples: readonly ["...notifications"];
                                    };
                                };
                                readonly createdAt: {
                                    readonly type: "string";
                                    readonly examples: readonly ["2020-05-10T06:49:34+0000"];
                                };
                                readonly updatedAt: {
                                    readonly type: "string";
                                    readonly examples: readonly ["2020-05-11T08:22:34+0000"];
                                };
                            };
                        };
                    };
                };
            };
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const GetEvents: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly location: {
                    readonly type: "string";
                    readonly format: "json";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined location or latlong string - see [formats](https://docs.tomorrow.io/reference/api-formats#locations)";
                };
                readonly insights: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "Pre-defined category names or custom insight IDs";
                };
                readonly buffer: {
                    readonly type: "number";
                    readonly format: "float";
                    readonly default: 1;
                    readonly minimum: -3.402823669209385e+38;
                    readonly maximum: 3.402823669209385e+38;
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "The buffer around locations, in case of pre-defined insight categories (in km)";
                };
            };
            readonly required: readonly ["location", "insights"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly data: {
                    readonly type: "object";
                    readonly properties: {
                        readonly events: {
                            readonly type: "array";
                            readonly items: {};
                        };
                    };
                };
            };
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const GetInsights: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const GetInsightsId: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly insightId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined insight";
                };
            };
            readonly required: readonly ["insightId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const GetLocations: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly data: {
                    readonly type: "object";
                    readonly properties: {
                        readonly locations: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly id: {
                                        readonly type: "string";
                                        readonly examples: readonly ["5e82fb82b66492001218aaf3"];
                                    };
                                    readonly name: {
                                        readonly type: "string";
                                        readonly examples: readonly ["Tomorrow.io Headquarters"];
                                    };
                                    readonly geometry: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly type: {
                                                readonly type: "string";
                                                readonly examples: readonly ["Point"];
                                            };
                                            readonly coordinates: {
                                                readonly type: "array";
                                                readonly items: {
                                                    readonly type: "number";
                                                    readonly default: 0;
                                                    readonly examples: readonly [42.35544];
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                readonly links: {
                    readonly type: "object";
                    readonly properties: {};
                };
            };
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const GetLocationsId: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly locationId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined location";
                };
            };
            readonly required: readonly ["locationId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly data: {
                    readonly type: "object";
                    readonly properties: {
                        readonly location: {
                            readonly type: "object";
                            readonly properties: {
                                readonly id: {
                                    readonly type: "string";
                                    readonly examples: readonly ["5e82fb82b66492001218aaf3"];
                                };
                                readonly name: {
                                    readonly type: "string";
                                    readonly examples: readonly ["Tomorrow.io Headquarters"];
                                };
                                readonly geometry: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly examples: readonly ["Point"];
                                        };
                                        readonly coordinates: {
                                            readonly type: "array";
                                            readonly items: {
                                                readonly type: "number";
                                                readonly default: 0;
                                                readonly examples: readonly [42.35544];
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const ListNotificationsGet: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly startTime: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "Start time in ISO 8601 format \"2019-03-20T14:09:50Z\"";
                };
                readonly endTime: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "End time in ISO 8601 format \"2019-03-20T14:09:50Z\"";
                };
                readonly alertIds: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "Filter by pre-defined alert IDs";
                };
                readonly notificationTypes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "Filter by [notification types](ref:overview-notifications#notification-configuration): [PRIOR, START, END,  PUBLISH]";
                };
                readonly recipients: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "Filter by user IDs";
                };
                readonly status: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "Filter by [status](ref:overview-notifications#notification-status): [ acknowledged, sent ]";
                };
                readonly locationIds: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "Filter by pre-defined location IDs";
                };
            };
            readonly required: readonly [];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const PostAlerts: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["name", "insight"];
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly description: "The name of the alert used by triggered alerts";
            };
            readonly insight: {
                readonly type: "string";
                readonly description: "ID of a custom insight or pre-defined Severe Weather Event category - e.g. \"floods\" or ”lightning” for lightning alerts";
            };
            readonly isActive: {
                readonly type: "boolean";
                readonly description: "Defines whether the alert triggers notifications to the webhook";
                readonly default: true;
            };
            readonly notifications: {
                readonly type: "string";
                readonly description: "The configuration of the notifications sent to the webhook (`PRIOR`, `START`, and `END` are available for Insight Alerts and `PUBLISH` is available for Severe Weather Event Alerts only).";
                readonly format: "json";
            };
            readonly lightningConfig: {
                readonly type: "string";
                readonly description: "configuration of lightning alert with following properties:  `lightningTypes` - an array of possible lightning types based on which alert detection happens. Allowed values: `C2C` (cloud to cloud) and `C2G` (cloud to ground). `buffers` - an array of radiuses based on which the alert detection happens (as soon as lightning strike occurs in one of the buffer, the alert notification is triggered). Minimum buffer value 0.6 and maximum value 48. Note that only first strike within the buffer triggers the alert notification.  `ttl` - duration of all-clear notification since the last strike happen within the buffer `distanceUnit` - the unit of buffer distance, allowed values `km` (kilometers) or `mi` (miles)";
                readonly format: "json";
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const PostAlertsIdActivate: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly alertId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined alert";
                };
            };
            readonly required: readonly ["alertId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "204": {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const PostAlertsIdDeactivate: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly alertId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined alert";
                };
            };
            readonly required: readonly ["alertId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "204": {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const PostAlertsIdLocations: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly alertId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined alert";
                };
            };
            readonly required: readonly ["alertId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly data: {
                    readonly type: "object";
                    readonly properties: {
                        readonly locations: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                                readonly examples: readonly ["5e82fb82b66492001218aaf3"];
                            };
                        };
                    };
                };
            };
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const PostAlertsIdLocationsLink: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["locations"];
        readonly properties: {
            readonly locations: {
                readonly type: "array";
                readonly description: "The list of Locations by ID to be linked to this Alert.";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly alertId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined alert";
                };
            };
            readonly required: readonly ["alertId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "204": {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const PostAlertsIdLocationsUnlink: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["locations"];
        readonly properties: {
            readonly locations: {
                readonly type: "array";
                readonly description: "The list of Point locations by ID to be unlinked from this alert.";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly alertId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined alert";
                };
            };
            readonly required: readonly ["alertId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "204": {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const PostEvents: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["insights"];
        readonly properties: {
            readonly location: {
                readonly type: "string";
                readonly description: "ID of a pre-defined location, GeoJSON geometry or latlong array - see [formats](https://docs.tomorrow.io/reference/api-formats#locations)";
                readonly format: "json";
            };
            readonly insights: {
                readonly type: "array";
                readonly description: "Pre-defined category names or custom insight IDs";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly buffer: {
                readonly type: "number";
                readonly description: "The buffer around locations, in case of pre-defined insight categories (in km)";
                readonly default: 1;
                readonly format: "float";
                readonly minimum: -3.402823669209385e+38;
                readonly maximum: 3.402823669209385e+38;
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly data: {
                    readonly type: "object";
                    readonly properties: {
                        readonly events: {
                            readonly type: "array";
                            readonly items: {};
                        };
                    };
                };
            };
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const PostInsights: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["name"];
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly description: "The name of the insight used when setting alert notifications";
            };
            readonly rules: {
                readonly type: "string";
                readonly description: "The [rules](https://docs.tomorrow.io/reference/insights-overview#rules-language) for which the linked locations will be checked. **Either rules or conditions is required** i.e (windSpeed > 30)";
            };
            readonly conditions: {
                readonly type: "string";
                readonly description: "The [conditions](https://docs.tomorrow.io/reference/insights-overview#conditions-language-ast-trees) for which the linked locations will be checked. Either rules or conditions is required";
                readonly format: "json";
            };
            readonly tags: {
                readonly type: "array";
                readonly description: "Any descriptive tags to be used to filter insights";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly severity: {
                readonly type: "string";
                readonly description: "The code denoting the intensity of impact when conditions occur (extreme, severe, moderate, minor, unknown)";
                readonly default: "unknown";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "The description detailing this insight use-case";
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "201": {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const PostLocations: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["name", "geometry"];
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly description: "The name of the location";
            };
            readonly geometry: {
                readonly type: "string";
                readonly description: "The GeoJSON geometry representation of the location object";
                readonly format: "json";
            };
            readonly tags: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly direction: {
                readonly type: "number";
                readonly description: "The location direction in degrees clockwise from due north";
                readonly format: "float";
                readonly minimum: -3.402823669209385e+38;
                readonly maximum: 3.402823669209385e+38;
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const PutAlertsId: {
    readonly body: {
        readonly type: "object";
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly description: "The name of the alert used by triggered alerts";
            };
            readonly notifications: {
                readonly type: "string";
                readonly description: "The configuration of the notifications sent to the webhook (`PRIOR`, `START`, and `END` are available for Insight Alerts and `PUBLISH` is available for Severe Weather Event Alerts only).";
                readonly format: "json";
            };
            readonly lightningConfig: {
                readonly type: "string";
                readonly description: "configuration of lightning alert with following properties:  `lightningTypes` - an array of possible lightning types based on which alert detection happens. Allowed values: `C2C` (cloud to cloud) and `C2G` (cloud to ground). `buffers` - an array of radiuses based on which the alert detection happens (as soon as lightning strike occurs in one of the buffer, the alert notification is triggered). Minimum buffer value 0.6 and maximum value 48. Note that only first strike within the buffer triggers the alert notification.  `ttl` - duration of all-clear notification since the last strike happen within the buffer `distanceUnit` - the unit of buffer distance, allowed values `km` (kilometers) or `mi` (miles)";
                readonly format: "json";
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly alertId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined alert";
                };
            };
            readonly required: readonly ["alertId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly data: {
                    readonly type: "object";
                    readonly properties: {
                        readonly alert: {
                            readonly type: "object";
                            readonly properties: {
                                readonly id: {
                                    readonly type: "string";
                                    readonly examples: readonly ["38f689d83c264eb0b084ba095f2ea743"];
                                };
                                readonly insight: {
                                    readonly type: "string";
                                    readonly examples: readonly ["38f689d83c264eb0b084ba095f2ea332"];
                                };
                                readonly name: {
                                    readonly type: "string";
                                    readonly examples: readonly ["De-icing Conditions Alert"];
                                };
                                readonly isActive: {
                                    readonly type: "boolean";
                                    readonly default: true;
                                    readonly examples: readonly [true];
                                };
                                readonly notifications: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                        readonly examples: readonly ["...notifications"];
                                    };
                                };
                                readonly createdAt: {
                                    readonly type: "string";
                                    readonly examples: readonly ["2020-05-10T06:49:34+0000"];
                                };
                                readonly updatedAt: {
                                    readonly type: "string";
                                    readonly examples: readonly ["2020-05-11T08:22:34+0000"];
                                };
                            };
                        };
                    };
                };
            };
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const PutInsightsId: {
    readonly body: {
        readonly type: "object";
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly description: "The name of the insight used when triggering alert notifications";
            };
            readonly rules: {
                readonly type: "string";
                readonly description: "The [rules](https://docs.tomorrow.io/reference/insights-overview#rules-language) for which the linked locations will be checked. i.e (windSpeed > 30)";
            };
            readonly conditions: {
                readonly type: "string";
                readonly description: "The [conditions](https://docs.tomorrow.io/reference/insights-overview#conditions-language-ast-trees) for which the linked locations will be checked.";
                readonly format: "json";
            };
            readonly tags: {
                readonly type: "array";
                readonly description: "Any descriptive tags to be used to filter insights";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly severity: {
                readonly type: "string";
                readonly description: "The code denoting the intensity of impact when conditions occur (extreme, severe, moderate, minor, unknown)";
                readonly default: "unknown";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "The description detailing this insight use-case";
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly insightId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined insight";
                };
            };
            readonly required: readonly ["insightId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const PutLocationId: {
    readonly body: {
        readonly type: "object";
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly description: "The name of the location. Name or direction parameters must be specified";
            };
            readonly direction: {
                readonly type: "number";
                readonly description: "The location direction in degrees clockwise from due north";
                readonly format: "float";
                readonly minimum: -3.402823669209385e+38;
                readonly maximum: 3.402823669209385e+38;
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly locationId: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                    readonly description: "ID of a pre-defined location";
                };
            };
            readonly required: readonly ["locationId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly data: {
                    readonly type: "object";
                    readonly properties: {
                        readonly location: {
                            readonly type: "object";
                            readonly properties: {
                                readonly id: {
                                    readonly type: "string";
                                    readonly examples: readonly ["5e82fb82b66492001218aaf3"];
                                };
                                readonly name: {
                                    readonly type: "string";
                                    readonly examples: readonly ["Tomorrow.io Headquarters"];
                                };
                                readonly geometry: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly examples: readonly ["Point"];
                                        };
                                        readonly coordinates: {
                                            readonly type: "array";
                                            readonly items: {
                                                readonly type: "number";
                                                readonly default: 0;
                                                readonly examples: readonly [42.35544];
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const RemoveInsightTags: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["insights", "tags"];
        readonly properties: {
            readonly insights: {
                readonly type: "array";
                readonly description: "List of insight IDs";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly tags: {
                readonly type: "array";
                readonly description: "List of tags to be removed from insights";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "204": {
            readonly type: "object";
            readonly properties: {};
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
        readonly "400": {
            readonly type: "object";
            readonly properties: {};
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const RemoveLocationTags: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["locations", "tags"];
        readonly properties: {
            readonly locations: {
                readonly type: "array";
                readonly description: "List of location IDs";
                readonly items: {
                    readonly type: "string";
                };
            };
            readonly tags: {
                readonly type: "array";
                readonly description: "List of tags to be removed from locations";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly "Accept-Encoding": {
                    readonly type: "string";
                    readonly default: "gzip";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "204": {
            readonly type: "object";
            readonly properties: {};
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
        readonly "400": {
            readonly type: "object";
            readonly properties: {};
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
export { AddInsightTags, AddLocationTags, DeleteAlertsId, DeleteInsightsId, DeleteLocationsId, EventsTimeline, GetAlerts, GetAlertsId, GetEvents, GetInsights, GetInsightsId, GetLocations, GetLocationsId, ListNotificationsGet, PostAlerts, PostAlertsIdActivate, PostAlertsIdDeactivate, PostAlertsIdLocations, PostAlertsIdLocationsLink, PostAlertsIdLocationsUnlink, PostEvents, PostInsights, PostLocations, PutAlertsId, PutInsightsId, PutLocationId, RemoveInsightTags, RemoveLocationTags };
