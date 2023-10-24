"use strict";



const C = require("../constants");

const DbService = require("db-mixin");
const ConfigLoader = require("config-mixin");



/**
 * Addons service
 */
module.exports = {
    name: "accounts.profiles",
    version: 1,

    mixins: [
        DbService({
            entityChangedEventMode: 'emit'
        }),
        ConfigLoader(['accounts.**']),

    ],

    /**
     * Service dependencies
     */
    dependencies: [],

    /**
     * Service settings
     */
    settings: {
        rest: '/v1/profiles/',

        fields: {

            owner: {
                type: "string",
                empty: false,
                //required: true,
                //readonly: true,
                onCreate({ ctx }) { return ctx.meta.userID },
                populate: {
                    action: "v1.accounts.resolve",
                    params: {
                        //fields: []
                    }
                }
            },


            firstName: {
                type: "string",
                required: false,
                trim: true,
                default: ''
            },
            lastName: {
                type: "string",
                required: false,
                trim: true,
                default: ''
            },
            about: {
                type: "string",
                required: false,
                trim: true,
                default: ''
            },

            company: {
                type: "string",
                required: false,
                trim: true,
                default: ''
            },

            job: {
                type: "string",
                required: false,
                trim: true,
                default: ''
            },


            address: {
                type: "string",
                required: false,
                trim: true,
                default: ''
            },
            country: {
                type: "string",
                required: false,
                trim: true,
                default: ''
            },

            phone: {
                type: "string",
                required: false,
                trim: true,
                default: ''
            },

            twitter: {
                type: "string",
                required: false,
                trim: true,
                default: ''
            },
            facebook: {
                type: "string",
                required: false,
                trim: true,
            },
            instagram: {
                type: "string",
                required: false,
                trim: true,
                default: ''
            },
            linkedin: {
                type: "string",
                required: false,
                trim: true,
                default: ''
            },

            
            ...DbService.FIELDS
        },
        defaultPopulates: [],

        scopes: {
            ...DbService.SCOPE
        },

        defaultScopes: ['owner',...DbService.DSCOPE]
    },
    
    /**
     * Actions
     */
    actions: {
        resolveProfile: {
            description: "Add members to the board",
            rest: "GET /me",
            params: {

            },
            permissions: [`accounts.profiles.resolveProfile`],
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                const entity = await this.findEntity(null, {
                    query: { owner: ctx.meta.userID }
                })



                return entity
            }
        },
        updateProfile: {
            description: "Add members to the board",
            rest: "PATCH /me",
            params: {

            },
            permissions: [`accounts.profiles.updateProfile`],
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                const update = {}

                const fields = ['firstName',
                    'lastName',
                    'about',
                    'company',
                    'job',
                    'address',
                    'country',
                    'phone',
                    'twitter',
                    'facebook',
                    'instagram',
                    'linkedin']

                for (let index = 0; index < fields.length; index++) {
                    const key = fields[index];
                    if (params.hasOwnProperty(key)) {
                        update[key] = params[key]
                    }
                }
                const entity = await this.findEntity(null, {
                    query: { owner: ctx.meta.userID },
                    fields: ['id']
                })
                return this.updateEntity(ctx, {
                    id: entity.id,
                    ...update
                });
            }
        },
    },

    /**
     * Events
     */
    events: {

        async "v1.accounts.created"(ctx) {
            const user = ctx.params.data;
            await this.createEntity(ctx, {
                owner: user.id
            })

        },
    },

    /**
     * Methods
     */
    methods: {

        /**
         * Validate the `owner` property of addon.
         */
        validateOwner({ ctx, value }) {
            return ctx
                .call("v1.accounts.resolve", {
                    id: value,
                    throwIfNotExist: true,
                    fields: ["status"]
                })
                .then(res =>
                    res && res.status == C.STATUS_ACTIVE
                        ? true
                        : `The owner '${value}' is not an active user.`
                )
            //.catch(err => err.message);
        }

    },

    /**
     * Service created lifecycle event handler
     */
    created() { },

    /**
     * Service started lifecycle event handler
     */
    started() { },

    /**
     * Service stopped lifecycle event handler
     */
    stopped() { }
};