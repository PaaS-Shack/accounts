"use strict";

const _ = require("lodash");
const C = require("../constants");

const { match } = require("moleculer").Utils;

const DbService = require("db-mixin");


/**
 * Addons service
 */
module.exports = {
    name: "roles",
    version: 1,

    mixins: [
        DbService({

        })
    ],

    /**
     * Service dependencies
     */
    dependencies: [],

    /**
     * Service settings
     */
    settings: {
        rest: true,


        fields: {


            name: {
                type: "string",
                required: true,
                trim: true,
                empty: false
            },
            description: {
                type: "string",
                required: true,
                trim: true,
                empty: false
            },
            permissions: {
                type: "array",
                items: {
                    type: "string",
                    required: true,
                    trim: true,
                    empty: false
                },
                required: true
            },
            inherits: {
                type: "array",
                items: {
                    type: "string",
                    required: true,
                    trim: true,
                    empty: false
                },
                default: [],
                required: false
            },
            status: { type: "number", required: true },




            ...DbService.FIELDS

        },
        defaultPopulates: [],

        scopes: {
            ...DbService.SCOPE
        },

        defaultScopes: [...DbService.DSCOPE]
    },

    /**
     * Actions
     */
    actions: {

        can: {
            rest: 'POST /can',
            cache: {
                keys: ["#roles", "permissions"]
            },
            params: {
                roles: { type: "array", items: "string" },
                permission: { type: "string" },
            },
            async handler(ctx) {
                return await this.can(ctx, ctx.params.roles, ctx.params.permission);
            }
        },

        hasAccess: {
            rest: 'POST /has-access',
            cache: {
                keys: ["#roles", "permissions"]
            },
            params: {
                roles: { type: "array", items: "string" },
                permissions: { type: "array", items: "string", min: 1 },
            },
            async handler(ctx) {
                return await this.hasAccess(ctx, ctx.params.roles, ctx.params.permissions);
            }
        },

        /**
         * Assigns the given permission to the role.
         * @param {String} id
         * @param {string} permission
         */
        assignPermission: {
            rest: 'POST /assign-permission',
            params: {
                id: "string",
                permission: "string"
            },
            async handler(ctx) {
                const entity = await this.actions.resolve({
                    id: ctx.params.id
                }, { parentCtx: ctx })
                return this.assignPermission(ctx, entity, ctx.params.permission);
            }
        },

        /**
         * Revokes the given permission from the role.
         *
         * @param {String} id
         * @param {string} permission
         */
        revokePermission: {
            rest: 'POST /revoke-permission',
            params: {
                id: "string",
                permission: "string"
            },
            async handler(ctx) {

                const entity = await this.actions.resolve({
                    id: ctx.params.id
                }, { parentCtx: ctx })
                return this.revokePermission(ctx, entity, ctx.params.permission);
            }
        },

        /**
         * Assigns the given role to the role.
         * @param {String} id
         * @param {string} permission
         */
        assignInheritance: {
            rest: 'POST /assign-inheritance',
            params: {
                id: "string",
                role: "string"
            },
            async handler(ctx) {
                const entity = await this.actions.resolve({
                    id: ctx.params.id
                }, { parentCtx: ctx })
                return this.assignInheritance(ctx, entity, ctx.params.role);
            }
        },

        /**
         * Revokes the given role from the role.
         *
         * @param {String} id
         * @param {string} role
         */
        revokeInheritance: {
            rest: 'POST /revoke-inheritance',
            params: {
                id: "string",
                role: "string"
            },
            async handler(ctx) {
                const entity = await this.actions.resolve({
                    id: ctx.params.id
                }, { parentCtx: ctx })
                return this.revokeInheritance(ctx, entity, ctx.params.role);
            }
        },

        /**
         * Syncs the given permissions with the role. This will revoke any permissions not supplied.
         *
         * @param {String} id
         * @param {Array<String>} permissions
         */
        syncPermissions: {
            params: {
                id: "string",
                permissions: { type: "array", items: "string" }
            },
            async handler(ctx) {

                const entity = await this.actions.resolve({
                    id: ctx.params.id
                }, { parentCtx: ctx })
                return this.syncPermissions(ctx, entity, ctx.params.permissions);
            }
        },

        /**
         * List all permissions for a given role
         *
         * @param {String} id
         * @param {Array<String>} permissions
         */
        getPermissions: {
            params: {
                role: "string"
            },
            async handler(ctx) {
                return this.getPermissions(ctx, ctx.params.role);
            }
        },
    },


    /**
     * Events
     */
    events: {

    },

    /**
     * Methods
     */
    methods: {
        /**
         * Assigns the given permission to the role.
         * @param {Object} role
         * @param {string} permission
         */
        async assignPermission(ctx, role, permission) {
            if (role.permissions.indexOf(permission) === -1) {
                return this.updateEntity(ctx, {
                    id: role.id,
                    permissions: [...role.permissions, permission]
                }, {
                    permissive: true
                })
            }
            return role;
        },
        /**
         * Assigns the given permission to the role.
         * @param {Object} role
         * @param {string} permission
         */
        async assignInheritance(ctx, role, permission) {
            if (role.inherits.indexOf(permission) === -1) {
                return this.updateEntity(ctx, {
                    id: role.id,
                    inherits: [...role.inherits, permission]
                }, {
                    permissive: true
                })
            }
            return role;
        },

        /**
         * Revokes the given permission from the role.
         *
         * @param {Object} role
         * @param {string} permission
         */
        async revokeInheritance(ctx, role, permission) {
            if (role.inherits.indexOf(permission) !== -1) {

                return this.updateEntity(ctx, {
                    id: role.id,
                    inherits: role.inherits.filter((perm) => perm !== permission)
                }, {
                    permissive: true
                })
            }
            return role;
        },

        /**
         * Revokes the given permission from the role.
         *
         * @param {Object} role
         * @param {string} permission
         */
        async revokePermission(ctx, role, permission) {
            if (role.permissions.indexOf(permission) !== -1) {

                return this.updateEntity(ctx, {
                    id: role.id,
                    permissions: role.permissions.filter((perm) => perm !== permission)
                }, {
                    permissive: true
                })
            }
            return role;
        },

        /**
         * Syncs the given permissions with the role. This will revoke any permissions not supplied.
         *
         * @param {Object} role
         * @param {Array<String>} permissions
         */
        async syncPermissions(ctx, role, permissions) {
            return this.updateEntity(ctx, {
                id: role.id,
                permissions: permissions

            }, {
                permissive: true
            })
        },
        /**
         * Get all permissions by user roles.
         *
         * @param {String|Array<string>} roleNames
         * @returns {Array<string>} List of permissions
         */
        async getPermissions(ctx, roleNames) {
            roleNames = Array.isArray(roleNames) ? roleNames : [roleNames];

            const roles = await this.findEntities(ctx, {
                query: { name: { $in: roleNames } }
            });

            let promises = [];
            for (let index = 0; index < roles.length; index++) {
                const role = roles[index];

                promises = promises.concat(role.permissions ? Array.from(role.permissions) : []);

                if (Array.isArray(role.inherits) && role.inherits.length > 0)
                    promises = promises.concat(this.getPermissions(ctx, role.inherits));
            }

            const permissions = await Promise.all(promises);

            return _.uniq(_.flattenDeep(permissions));
        },

        /**
         * Check if user has the given role. A user must have at least one role in order to return true.
         *
         * @param {Array<String>|String} roleNames
         * @param {string} role
         * @returns {boolean}
         */
        async hasRole(ctx, roleNames, role) {
            roleNames = Array.isArray(roleNames) ? roleNames : [roleNames];
            let res = Array.isArray(roleNames) && roleNames.indexOf(role) !== -1;
            if (!res) {
                // Check inherits

                const entities = await this.findEntities(ctx, {
                    query: { name: { $in: roleNames } }
                });
                if (Array.isArray(entities) && entities.length > 0) {
                    const inherits = _.uniq(_.compact(_.flattenDeep(entities.map(entity => entity.inherits))));
                    if (inherits.length > 0)
                        res = await this.hasRole(ctx, inherits, role);
                }
            }
            return res;
        },

        /**
         * Checks if the user has the given permission.
         *
         * @param {Array<String>|String} roleNames
         * @param {string} permission
         * @returns {boolean}
         */
        async can(ctx, roleNames, permission) {
            roleNames = Array.isArray(roleNames) ? roleNames : [roleNames];

            const permList = await this.getPermissions(ctx, roleNames);

            return permList.some(p => match(permission, p));
        },

        /**
         * Checks if the user has the given permission(s). At least one permission must be
         * accountable in order to return true.
         *
         * @param {Array<String>|String} roleNames
         * @param {Array<string>} permissions
         * @returns {boolean}
         */
        async canAtLeast(ctx, roleNames, permissions) {
            roleNames = Array.isArray(roleNames) ? roleNames : [roleNames];

            const permList = await this.getPermissions(ctx, roleNames);
            return permissions.some(perm => permList.find(p => match(perm, p)));
        },

        /**
         * Checks if the user has the given permission(s) or role(s). At least one
         * permission or role must be accountable in order to return true.
         *
         * @param {Array<String>|String} roleNames
         * @param {Array<string>} permissionsAndRoles
         * @returns {boolean}
         */
        async hasAccess(ctx, roleNames, permissionsAndRoles) {
            const res = await Promise.all(permissionsAndRoles.map(async p => {
                if (p.indexOf(".") !== -1)
                    return await this.can(ctx, roleNames, p);
                else
                    return await this.hasRole(ctx, roleNames, p);
            }));
            return res.some(p => !!p);
        },


        /**
         * Seed an empty collection with an `admin` and a `user` roles.
         */
        async seedDB() {
            const res = await this.createEntities(
                null, [
                {
                    name: "administrator",
                    description: "System Administrator",
                    permissions: [
                        "**"
                    ],
                    status: 1,
                },

                // User
                {
                    name: "user",
                    description: "Registered User",
                    permissions: [
                        "domains.create",
                        "domains.read",
                        "domains.update",
                        "domains.remove",
                    ],
                    status: 1
                }
            ]);

            this.logger.info(`Generated ${res.length} ACL roles.`);
        },
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
