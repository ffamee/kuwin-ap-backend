// // src/types/net-snmp/index.d.ts

// Type definitions for net-snmp 3.22
// Project: https://github.com/markabrahams/node-net-snmp
// Definitions by: Your Name/Organization <https://your.website>
// Original Definitions: https://github.com/markabrahams/node-net-snmp/blob/master/index.js

/// <reference types="node" />

declare module 'net-snmp' {
  import { Buffer } from 'buffer';
  import { RemoteInfo } from 'dgram';

  // =========================================================================
  // 1. Constants
  // =========================================================================

  /**
   * Constants for SNMP versions.
   */
  export const Version1 = 0;
  export const Version2c = 1;
  export const Version3 = 3;
  const Version: {
    readonly '1': 0;
    readonly '2c': 1;
    readonly '3': 3;
  };
  type Version = (typeof Version)[keyof typeof Version];

  /**
   * Constants for SNMP PDU types as per RFC 3416.
   */
  const PduType: {
    readonly GetRequest: 160;
    readonly GetNextRequest: 161;
    readonly GetResponse: 162;
    readonly SetRequest: 163;
    readonly Trap: 164;
    readonly GetBulkRequest: 165;
    readonly InformRequest: 166;
    readonly TrapV2: 167;
    readonly Report: 168;
  };
  type PduType = typeof PduType;

  /**
   * Constants for SNMP error-status field in response PDUs.
   */
  const ErrorStatus: {
    readonly NoError: 0;
    readonly TooBig: 1;
    readonly NoSuchName: 2;
    readonly BadValue: 3;
    readonly ReadOnly: 4;
    readonly GeneralError: 5;
    readonly NoAccess: 6;
    readonly WrongType: 7;
    readonly WrongLength: 8;
    readonly WrongEncoding: 9;
    readonly WrongValue: 10;
    readonly NoCreation: 11;
    readonly InconsistentValue: 12;
    readonly ResourceUnavailable: 13;
    readonly CommitFailed: 14;
    readonly UndoFailed: 15;
    readonly AuthorizationError: 16;
    readonly NotWritable: 17;
    readonly InconsistentName: 18;
  };
  type ErrorStatus = typeof ErrorStatus;

  /**
   * Constants for specifying syntax for varbind objects.
   */
  const ObjectType: {
    readonly Boolean: 1;
    readonly Integer: 2;
    readonly BitString: 3;
    readonly OctetString: 4;
    readonly Null: 5;
    readonly OID: 6;
    readonly IpAddress: 64;
    readonly Counter: 65; // Counter32
    readonly Gauge: 66; // Gauge32
    readonly TimeTicks: 67;
    readonly Opaque: 68;
    readonly Integer32: 69;
    readonly Counter32: 70;
    readonly Gauge32: 71;
    readonly Unsigned32: 72;
    readonly Counter64: 73;
    readonly NoSuchObject: 128;
    readonly NoSuchInstance: 129;
    readonly EndOfMibView: 130;
  };
  type ObjectType = typeof ObjectType;

  /**
   * Constants for SNMP trap types.
   */
  const TrapType: {
    readonly ColdStart: 0;
    readonly WarmStart: 1;
    readonly LinkDown: 2;
    readonly LinkUp: 3;
    readonly AuthenticationFailure: 4;
    readonly EgpNeighborLoss: 5;
    readonly EnterpriseSpecific: 6;
  };
  type TrapType = typeof TrapType;

  /**
   * Constants for SNMPv3 message security levels.
   */
  const SecurityLevel: {
    readonly noAuthNoPriv: 1;
    readonly authNoPriv: 2;
    readonly authPriv: 3;
  };
  type SecurityLevel = typeof SecurityLevel;

  /**
   * Constants for SNMPv3 authentication protocols.
   */
  const AuthProtocols: {
    readonly none: 'none';
    readonly md5: 'md5';
    readonly sha: 'sha';
    readonly sha224: 'sha224';
    readonly sha256: 'sha256';
    readonly sha384: 'sha384';
    readonly sha512: 'sha512';
  };
  type AuthProtocols = (typeof AuthProtocols)[keyof typeof AuthProtocols];

  /**
   * Constants for SNMPv3 privacy protocols (encryption algorithms).
   */
  const PrivProtocols: {
    readonly none: 'none';
    readonly des: 'des';
    readonly aes: 'aes'; // 128-bit AES
    readonly aes256b: 'aes256b'; // 256-bit AES with "Blumenthal" key localization
    readonly aes256r: 'aes256r'; // 256-bit AES with "RFC" key localization
  };
  type PrivProtocols = (typeof PrivProtocols)[keyof typeof PrivProtocols];

  /**
   * Constants for AgentX PDU types.
   */
  const AgentXPduType: {
    readonly Open: 1;
    readonly Close: 2;
    readonly Register: 3;
    readonly Unregister: 4;
    readonly Get: 5;
    readonly GetNext: 6;
    readonly GetBulk: 7;
    readonly TestSet: 8;
    readonly CommitSet: 9;
    readonly UndoSet: 10;
    readonly CleanupSet: 11;
    readonly Notify: 12;
    readonly Ping: 13;
    readonly IndexAllocate: 14;
    readonly IndexDeallocate: 15;
    readonly AddAgentCaps: 16;
    readonly RemoveAgentCaps: 17;
    readonly Response: 18;
  };
  type AgentXPduType = typeof AgentXPduType;

  /**
   * Constants for access control model types.
   */
  const AccessControlModelType: {
    readonly None: 0;
    readonly Simple: 1;
  };
  type AccessControlModelType = typeof AccessControlModelType;

  /**
   * Constants for access levels.
   */
  const AccessLevel: {
    readonly None: 0;
    readonly ReadOnly: 1;
    readonly ReadWrite: 2;
  };
  type AccessLevel = (typeof AccessLevel)[keyof typeof AccessLevel];

  /**
   * Constants for MaxAccess as per SMIv2.
   */
  const MaxAccess: {
    readonly 'not-accessible': 0;
    readonly 'accessible-for-notify': 1;
    readonly 'read-only': 2;
    readonly 'read-write': 3;
    readonly 'read-create': 4;
  };
  type MaxAccess = (typeof MaxAccess)[keyof typeof MaxAccess];

  /**
   * Constants for RowStatus as per SMIv2.
   */
  const RowStatus: {
    readonly active: 1;
    readonly notInService: 2;
    readonly notReady: 3;
    readonly createAndGo: 4;
    readonly createAndWait: 5;
    readonly destroy: 6;
  };
  type RowStatus = typeof RowStatus;

  /**
   * Constants for response invalid codes.
   */
  const ResponseInvalidCode: {
    readonly EIp4AddressSize: 1;
    readonly EUnknownObjectType: 2;
    readonly EUnknownPduType: 3;
    readonly ECouldNotDecrypt: 4;
    readonly EAuthFailure: 5;
    readonly EReqResOidNoMatch: 6;
    // readonly ENonRepeaterCountMismatch: 7;
    readonly EOutOfOrder: 8;
    readonly EVersionNoMatch: 9;
    readonly ECommunityNoMatch: 10;
    readonly EUnexpectedReport: 11;
    readonly EResponseNotHandled: 12;
    readonly EUnexpectedResponse: 13;
  };
  type ResponseInvalidCode = typeof ResponseInvalidCode;

  /**
   * Constants for OID formats.
   */
  const OidFormat: {
    readonly Oid: 'oid';
    readonly Path: 'path';
    readonly Module: 'module';
  };
  type OidFormat = (typeof OidFormat)[keyof typeof OidFormat];

  /**
   * Constants for MIB provider types.
   */
  const MibProviderType: {
    readonly Scalar: 'Scalar';
    readonly Table: 'Table';
  };
  type MibProviderType = typeof MibProviderType;

  // =========================================================================
  // 2. Interfaces for Data Structures
  // =========================================================================

  /**
   * Represents a single SNMP variable binding.
   */
  interface Varbind {
    oid: string;
    type: ObjectType;
    value: string | number | boolean | Buffer | null | undefined;
  }

  /**
   * Common callback function signature for asynchronous operations.
   */
  type Callback<T> = (error: Error | null, result?: T) => void;

  /**
   * Options for creating an SNMP Session (v1/v2c).
   */
  interface SessionOptions {
    port?: number;
    retries?: number;
    timeout?: number;
    backoff?: number;
    transport?: 'udp4' | 'udp6';
    trapPort?: number;
    version?: Version;
    backwardsGetNexts?: boolean;
    reportOidMismatchErrors?: boolean;
    idBitsSize?: number;
    sourceAddress?: string; // For binding to a specific local IP address
    sockets?: any; // Array of dgram.Socket objects
  }

  /**
   * Options for creating an SNMPv3 Session.
   */
  interface SessionV3Options {
    port?: number;
    retries?: number;
    timeout?: number;
    backoff?: number;
    transport?: 'udp4' | 'udp6';
    trapPort?: number;
    version?: Version;
    engineID?: Buffer | string;
    backwardsGetNexts?: boolean;
    reportOidMismatchErrors?: boolean;
    idBitsSize?: number;
    sourceAddress?: string; // For binding to a specific local IP address
    sockets?: any; // Array of dgram.Socket objects
  }

  /**
   * User object for SNMPv3 sessions.
   */
  interface V3UserOptions {
    name: string;
    level: SecurityLevel;
    authProtocol?: AuthProtocols;
    authKey?: Buffer | string;
    privProtocol?: PrivProtocols;
    privKey?: Buffer | string;
    engineBoots?: number;
    engineTime?: number;
  }

  /**
   * Options for creating an SNMP Receiver.
   */
  interface ReceiverOptions {
    port?: number;
    disableAuthorization?: boolean;
    includeAuthentication?: boolean;
    accessControlModelType?: AccessControlModelType;
    engineID?: Buffer | string;
    address?: string; // For binding to a specific local IP address
    transport?: 'udp4' | 'udp6';
    sockets?: any; // Array of dgram.Socket objects
  }

  /**
   * Notification object received by a Receiver.
   */
  interface Notification {
    rinfo: RemoteInfo;
    pdu: any; // PDU object structure can be complex
    trapOid: string;
    varbinds: Varbind;
    agentAddr?: string;
    enterpriseOid?: string;
    generic?: number;
    specific?: number;
    uptime?: number;
  }

  /**
   * Options for creating an SNMP Agent.
   */
  interface AgentOptions {
    port?: number;
    disableAuthorization?: boolean;
    accessControlModelType?: AccessControlModelType;
    engineID?: Buffer | string;
    address?: string; // For binding to a specific local IP address
    transport?: 'udp4' | 'udp6';
    sockets?: any; // Array of dgram.Socket objects
    mibOptions?: any; // Options passed to the Mib instance
  }

  /**
   * Base definition for MIB providers.
   */
  interface BaseMibProviderDefinition {
    name: string;
    oid: string;
    maxAccess?: MaxAccess;
    defVal?: any;
    constraints?: {
      min?: number;
      max?: number;
      size?: number;
      values?: { [key: string]: number };
    };
    handler?: (
      pdu: any,
      varbind: Varbind,
      context: any,
      callback: Callback<Varbind>,
    ) => void;
  }

  /**
   * Definition for a scalar MIB provider.
   */
  interface ScalarMibProviderDefinition extends BaseMibProviderDefinition {
    type: 'scalar';
    scalarType: ObjectType;
  }

  /**
   * Definition for a table MIB provider.
   */
  interface TableMibProviderDefinition extends BaseMibProviderDefinition {
    type: 'table';
    tableColumns: Array<{
      oid: string;
      type: ObjectType;
      name: string;
    }>;
    tableIndex: string;
    tableAugments?: string;
    createHandler?: (
      pdu: any,
      varbind: Varbind,
      context: any,
      callback: Callback<Varbind>,
    ) => void;
  }

  /**
   * Union type for all MIB provider definitions.
   */
  type MibProviderDefinition =
    | ScalarMibProviderDefinition
    | TableMibProviderDefinition;

  /**
   * Options for creating a ModuleStore.
   */
  interface ModuleStoreOptions {
    baseModules?: string; // Array of module names to load initially
  }

  /**
   * Options for creating a Subagent.
   */
  interface SubagentOptions {
    master?: string;
    masterPort?: number;
    timeout?: number;
    description?: string;
    mibOptions?: any; // Options passed to the Mib instance
    mib?: Mib; // Pre-existing Mib instance
  }

  // =========================================================================
  // 3. Custom Error Classes
  // =========================================================================

  /**
   * Base class for net-snmp specific errors.
   */
  class NetSnmpError extends Error {
    constructor(message?: string);
  }

  /**
   * Remote host failed to process a request.
   */
  class RequestFailedError extends NetSnmpError {}

  /**
   * Failure to render a request message or invalid parameter.
   */
  class RequestInvalidError extends NetSnmpError {}

  /**
   * No response received for a request within the timeout.
   */
  class RequestTimedOutError extends NetSnmpError {}

  /**
   * Failure to parse a response message.
   */
  class ResponseInvalidError extends NetSnmpError {}

  /**
   * Receiver or agent unable to decode a packet.
   */
  class ProcessingError extends NetSnmpError {
    rinfo: RemoteInfo;
    buffer: Buffer;
    originalError: Error;
    constructor(
      message: string,
      rinfo: RemoteInfo,
      buffer: Buffer,
      originalError: Error,
    );
  }

  // =========================================================================
  // 4. Class Type Definitions
  // =========================================================================

  /**
   * Represents an SNMP session for command generation and notification origination.
   */
  class Session {
    private constructor(); // Private constructor to enforce factory creation

    /**
     * Fetches values for one or more OIDs.
     * @param oids An array of OID strings.
     * @param callback The callback function to handle the response.
     */
    get(oids: string, callback: Callback<Varbind>): void;

    /**
     * Fetches values for OIDs lexicographically following specified OIDs,
     * with options for non-repeaters and max repetitions.
     * @param oids An array of OID strings.
     * @param nonRepeaters The number of OIDs in `oids` that are non-repeaters.
     * @param maxRepetitions The maximum number of repetitions for repeating OIDs.
     * @param callback The callback function to handle the response.
     */
    getBulk(
      oids: string,
      nonRepeaters: number,
      maxRepetitions: number,
      callback: Callback<Varbind>,
    ): void;

    /**
     * Fetches values for OIDs lexicographically following specified OIDs.
     * @param oids An array of OID strings.
     * @param callback The callback function to handle the response.
     */
    getNext(oids: string, callback: Callback<Varbind>): void;

    /**
     * Sends an SNMP inform.
     * @param typeOrOid The trap type (from `snmp.TrapType`) or an OID string.
     * @param varbinds An array of varbind objects.
     * @param options Optional object containing agentAddr.
     * @param callback The callback function to handle completion.
     */
    inform(
      typeOrOid: string | number,
      varbinds: Varbind,
      options?: { agentAddr?: string },
      callback?: Callback<void>,
    ): void;

    /**
     * Sets the value of one or more OIDs.
     * @param varbinds An array of varbind objects to set.
     * @param callback The callback function to handle the response.
     */
    set(varbinds: Varbind, callback: Callback<Varbind>): void;

    /**
     * Fetches all OIDs lexicographically following a specified OID within the same MIB subtree.
     * Uses `feedCallback` for incremental results and `doneCallback` for completion or error.
     * @param oid The OID string of the subtree to walk.
     * @param maxRepetitions The maximum number of repetitions for GetBulk requests (for SNMPv2c/v3).
     * @param feedCallback Callback for incremental results.
     * @param doneCallback Callback for completion or error.
     */
    subtree(
      oid: string,
      maxRepetitions: number,
      feedCallback: Callback<Varbind>,
      doneCallback: Callback<void>,
    ): void;

    /**
     * Fetches conceptual tables, structuring results into objects representing rows keyed by index.
     * @param oid The OID string of the table.
     * @param maxRepetitions The maximum number of repetitions for GetBulk requests (for SNMPv2c/v3).
     * @param callback The callback function to handle the table data.
     */
    table(
      oid: string,
      maxRepetitions: number,
      callback: Callback<{ [rowIndex: string]: { [columnOid: string]: any } }>,
    ): void;

    /**
     * Similar to `table()`, but fetches only specified columns for efficiency.
     * @param oid The OID string of the table.
     * @param columns An array of OID strings for the columns to fetch.
     * @param maxRepetitions The maximum number of repetitions for GetBulk requests (for SNMPv2c/v3).
     * @param callback The callback function to handle the table data.
     */
    tableColumns(
      oid: string,
      columns: string,
      maxRepetitions: number,
      callback: Callback<{ [rowIndex: string]: { [columnOid: string]: any } }>,
    ): void;

    /**
     * Sends an SNMP trap.
     * @param typeOrOid The trap type (from `snmp.TrapType`) or an OID string.
     * @param varbinds An array of varbind objects.
     * @param agentAddrOrOptions Optional agent address string or options object.
     * @param callback The callback function to handle completion.
     */
    trap(
      typeOrOid: string | number,
      varbinds: Varbind,
      agentAddrOrOptions?: string | { agentAddr?: string },
      callback?: Callback<void>,
    ): void;

    /**
     * Closes the session's underlying UDP socket.
     */
    close(): void;

    /**
     * Emitted when the session's underlying UDP socket is closed.
     * @param event The event name 'close'.
     * @param listener The callback function.
     */
    on(event: 'close', listener: () => void): this;

    /**
     * Emitted when the session's underlying UDP socket emits an error.
     * @param event The event name 'error'.
     * @param listener The callback function.
     */
    on(event: 'error', listener: (error: Error) => void): this;
  }

  /**
   * Handles receiving SNMP notifications (traps and informs).
   */
  class Receiver {
    private constructor(); // Private constructor to enforce factory creation

    /**
     * Returns the receiver's Authorizer instance.
     */
    getAuthorizer(): Authorizer;

    /**
     * Closes the receiver's listening socket(s).
     * @param callback Optional callback function to handle completion.
     */
    close(callback?: Callback<void>): void;

    /**
     * Emitted when the receiver's underlying UDP socket is closed.
     * @param event The event name 'close'.
     * @param listener The callback function.
     */
    on(event: 'close', listener: () => void): this;

    /**
     * Emitted when the receiver's underlying UDP socket emits an error.
     * @param event The event name 'error'.
     * @param listener The callback function.
     */
    on(event: 'error', listener: (error: Error) => void): this;
  }

  /**
   * Implements an SNMP agent that responds to Get, GetNext, GetBulk, and Set requests.
   */
  class Agent {
    private constructor(); // Private constructor to enforce factory creation

    /**
     * Returns the agent's Authorizer instance.
     */
    getAuthorizer(): Authorizer;

    /**
     * Returns the agent's Mib instance.
     */
    getMib(): Mib;

    /**
     * Sets the agent's Mib instance.
     * @param mib The Mib instance to set.
     */
    setMib(mib: Mib): void;

    /**
     * Returns the agent's Forwarder instance.
     */
    getForwarder(): Forwarder;

    /**
     * Closes the agent's listening socket(s).
     * @param callback Optional callback function to handle completion.
     */
    close(callback?: Callback<void>): void;

    /**
     * Emitted when the agent's underlying UDP socket is closed.
     * @param event The event name 'close'.
     * @param listener The callback function.
     */
    on(event: 'close', listener: () => void): this;

    /**
     * Emitted when the agent's underlying UDP socket emits an error.
     * @param event The event name 'error'.
     * @param listener The callback function.
     */
    on(event: 'error', listener: (error: Error) => void): this;
  }

  /**
   * Manages authorization lists for SNMP communities (v1/v2c) and users (v3)
   * for Receiver and Agent instances.
   */
  class Authorizer {
    private constructor(); // Private constructor

    /**
     * Adds a community string and optionally an access level.
     * @param community The community string.
     * @param accessLevel Optional access level.
     */
    addCommunity(community: string, accessLevel?: AccessLevel): void;

    /**
     * Retrieves a community string.
     * @param community The community string to retrieve.
     * @returns The community object or undefined if not found.
     */
    getCommunity(
      community: string,
    ): { community: string; accessLevel: AccessLevel } | undefined;

    /**
     * Returns the list of communities.
     * @returns An array of community objects.
     */
    getCommunities(): Array<{ community: string; accessLevel: AccessLevel }>;

    /**
     * Deletes a community string.
     * @param community The community string to delete.
     */
    deleteCommunity(community: string): void;

    /**
     * Adds a user object and optionally an access level.
     * @param user The user object.
     * @param accessLevel Optional access level.
     */
    addUser(user: V3UserOptions, accessLevel?: AccessLevel): void;

    /**
     * Retrieves a user object by name.
     * @param userName The name of the user to retrieve.
     * @returns The user object or undefined if not found.
     */
    getUser(userName: string): V3UserOptions | undefined;

    /**
     * Returns the list of users.
     * @returns An array of user objects.
     */
    getUsers(): V3UserOptions;

    /**
     * Deletes a user by name.
     * @param userName The name of the user to delete.
     */
    deleteUser(userName: string): void;

    /**
     * Returns the access control model type.
     * @returns The access control model type.
     */
    getAccessControlModelType(): AccessControlModelType;

    /**
     * Returns the access control model object (e.g., SimpleAccessControlModel).
     * @returns The access control model or null.
     */
    getAccessControlModel(): SimpleAccessControlModel | null;
  }

  /**
   * Provides basic three-level access control (None, ReadOnly, ReadWrite)
   * for communities or users within an Agent.
   */
  class SimpleAccessControlModel {
    private constructor(); // Private constructor

    /**
     * Grants access level to a community.
     * @param community The community string.
     * @param accessLevel The access level to grant.
     */
    setCommunityAccess(community: string, accessLevel: AccessLevel): void;

    /**
     * Removes access for a community.
     * @param community The community string.
     */
    removeCommunityAccess(community: string): void;

    /**
     * Returns the access level for a community.
     * @param community The community string.
     * @returns The access level.
     */
    getCommunityAccessLevel(community: string): AccessLevel;

    /**
     * Returns all community access control entries.
     * @returns An array of community access objects.
     */
    getCommunitiesAccess(): Array<{
      community: string;
      accessLevel: AccessLevel;
    }>;

    /**
     * Grants access level to a user.
     * @param userName The user name.
     * @param accessLevel The access level to grant.
     */
    setUserAccess(userName: string, accessLevel: AccessLevel): void;

    /**
     * Removes access for a user.
     * @param userName The user name.
     */
    removeUserAccess(userName: string): void;

    /**
     * Returns the access level for a user.
     * @param userName The user name.
     * @returns The access level.
     */
    getUserAccessLevel(userName: string): AccessLevel;

    /**
     * Returns all user access control entries.
     * @returns An array of user access objects.
     */
    getUsersAccess(): Array<{ userName: string; accessLevel: AccessLevel }>;
  }

  /**
   * Manages management information in a tree structure using Object IDs (OIDs).
   */
  class Mib {
    private constructor(); // Private constructor to enforce factory creation

    /**
     * Registers a provider definition (scalar or table).
     * @param definition The MIB provider definition.
     */
    registerProvider(definition: MibProviderDefinition): void;

    /**
     * Convenience method to register multiple providers.
     * @param definitions An array of MIB provider definitions.
     */
    registerProviders(definitions: MibProviderDefinition): void;

    /**
     * Unregisters a provider and deletes associated MIB nodes.
     * @param name The name of the provider to unregister.
     */
    unregisterProvider(name: string): void;

    /**
     * Returns all registered provider definitions.
     * @returns An array of MIB provider definitions.
     */
    getProviders(): MibProviderDefinition;

    /**
     * Returns a single registered provider by name.
     * @param name The name of the provider.
     * @returns The MIB provider definition or undefined if not found.
     */
    getProvider(name: string): MibProviderDefinition | undefined;

    /**
     * Retrieves a scalar value.
     * @param scalarProviderName The name of the scalar provider.
     * @returns The scalar value.
     */
    getScalarValue(scalarProviderName: string): any;

    /**
     * Sets a scalar value.
     * @param scalarProviderName The name of the scalar provider.
     * @param value The value to set.
     */
    setScalarValue(scalarProviderName: string, value: any): void;

    /**
     * Adds a table row.
     * @param tableProviderName The name of the table provider.
     * @param row An object representing the row data.
     */
    addTableRow(
      tableProviderName: string,
      row: { [columnName: string]: any },
    ): void;

    /**
     * Returns column definitions for a table.
     * @param tableProviderName The name of the table provider.
     * @returns An array of column definitions.
     */
    getTableColumnDefinitions(tableProviderName: string): any;

    /**
     * Returns table data as a two-dimensional array.
     * @param tableProviderName The name of the table provider.
     * @param byRow If true, returns rows; otherwise, returns columns.
     * @param includeInstances If true, includes instance OIDs.
     * @returns A 2D array of table cells.
     */
    getTableCells(
      tableProviderName: string,
      byRow?: boolean,
      includeInstances?: boolean,
    ): any;

    /**
     * Returns a single column of table data.
     * @param tableProviderName The name of the table provider.
     * @param columnNumber The column number (1-based index).
     * @param includeInstances If true, includes instance OIDs.
     * @returns An array of cell values for the specified column.
     */
    getTableColumnCells(
      tableProviderName: string,
      columnNumber: number,
      includeInstances?: boolean,
    ): any;

    /**
     * Returns a single row of table data.
     * @param tableProviderName The name of the table provider.
     * @param rowIndex The index of the row.
     * @returns An array of cell values for the specified row.
     */
    getTableRowCells(tableProviderName: string, rowIndex: string): any;

    /**
     * Returns a single cell value from a table.
     * @param tableProviderName The name of the table provider.
     * @param columnNumber The column number (1-based index).
     * @param rowIndex The index of the row.
     * @returns The cell value.
     */
    getTableSingleCell(
      tableProviderName: string,
      columnNumber: number,
      rowIndex: string,
    ): any;

    /**
     * Sets a single cell value in a table.
     * @param tableProviderName The name of the table provider.
     * @param columnNumber The column number (1-based index).
     * @param rowIndex The index of the row.
     * @param value The value to set.
     */
    setTableSingleCell(
      tableProviderName: string,
      columnNumber: number,
      rowIndex: string,
      value: any,
    ): void;

    /**
     * Deletes a table row.
     * @param tableProviderName The name of the table provider.
     * @param rowIndex The index of the row to delete.
     */
    deleteTableRow(tableProviderName: string, rowIndex: string): void;

    /**
     * Adds a default value to a scalar provider.
     * @param scalarProviderName The name of the scalar provider.
     * @param defaultValue The default value.
     */
    setScalarDefaultValue(scalarProviderName: string, defaultValue: any): void;

    /**
     * Adds default values to table columns.
     * @param tableProviderName The name of the table provider.
     * @param defaultValues An object mapping column names to default values.
     */
    setTableRowDefaultValues(
      tableProviderName: string,
      defaultValues: { [columnName: string]: any },
    ): void;

    /**
     * Dumps the MIB in text format.
     * @param options Optional dump options.
     * @returns A string representation of the MIB.
     */
    dump(options?: { includeInstances?: boolean }): string;
  }

  /**
   * Provides MIB parsing and OID translation capabilities.
   */
  class ModuleStore {
    private constructor(); // Private constructor to enforce factory creation

    /**
     * Loads MIB modules from a file.
     * @param fileName The path to the MIB file.
     */
    loadFromFile(fileName: string): void;

    /**
     * Retrieves a named MIB module as a JSON object.
     * @param moduleName The name of the module.
     * @returns The MIB module object.
     */
    getModule(moduleName: string): any;

    /**
     * Retrieves all MIB modules.
     * @param includeBase If true, includes base MIB modules.
     * @returns An array of MIB module objects.
     */
    getModules(includeBase?: boolean): any;

    /**
     * Retrieves names of all MIB modules.
     * @param includeBase If true, includes base MIB modules.
     * @returns An array of MIB module names.
     */
    getModuleNames(includeBase?: boolean): string;

    /**
     * Returns an array of Mib provider definitions for a module.
     * @param moduleName The name of the module.
     * @returns An array of MIB provider definitions.
     */
    getProvidersForModule(moduleName: string): MibProviderDefinition;

    /**
     * Translates an OID between numerical, named path, and module-qualified formats.
     * @param oid The OID string to translate.
     * @param destinationFormat The desired output format.
     * @returns The translated OID string.
     */
    translate(oid: string, destinationFormat: OidFormat): string;
  }

  /**
   * Supports SNMPv3 proxy forwarding (singleton within an Agent).
   */
  class Forwarder {
    private constructor(); // Private constructor

    /**
     * Adds a new proxy entry.
     * @param proxy The proxy definition object.
     */
    addProxy(proxy: {
      context: string;
      target: string;
      user: V3UserOptions;
    }): void;

    /**
     * Deletes a proxy by context.
     * @param context The context string of the proxy to delete.
     */
    deleteProxy(context: string): void;

    /**
     * Returns a proxy by context.
     * @param context The context string of the proxy.
     * @returns The proxy definition or undefined if not found.
     */
    getProxy(
      context: string,
    ): { context: string; target: string; user: V3UserOptions } | undefined;

    /**
     * Returns all registered proxies.
     * @returns An array of proxy definition objects.
     */
    getProxies(): Array<{
      context: string;
      target: string;
      user: V3UserOptions;
    }>;

    /**
     * Prints a dump of proxy definitions.
     * @returns A string representation of the proxies.
     */
    dumpProxies(): string;
  }

  /**
   * Implements AgentX protocol functionality to extend a master SNMP agent.
   */
  class Subagent {
    private constructor(); // Private constructor to enforce factory creation

    /**
     * Returns the subagent's Mib instance.
     */
    getMib(): Mib;

    /**
     * Sends an Open PDU to the master agent.
     * @param callback The callback function to handle completion.
     */
    open(callback: Callback<void>): void;

    /**
     * Sends a Close PDU to the master agent.
     * @param callback The callback function to handle completion.
     */
    close(callback: Callback<void>): void;

    /**
     * Registers a MIB region with the master agent.
     * @param provider The MIB provider definition.
     * @param callback The callback function to handle completion.
     */
    registerProvider(
      provider: MibProviderDefinition,
      callback: Callback<void>,
    ): void;

    /**
     * Unregisters a MIB region with the master agent.
     * @param name The name of the provider to unregister.
     * @param callback The callback function to handle completion.
     */
    unregisterProvider(name: string, callback: Callback<void>): void;

    /**
     * Convenience method for registering multiple providers.
     * @param definitions An array of MIB provider definitions.
     * @param callback The callback function to handle completion.
     */
    registerProviders(
      definitions: MibProviderDefinition,
      callback: Callback<void>,
    ): void;

    /**
     * Adds an agent capability to the master agent's sysORTable.
     * @param oid The OID of the agent capability.
     * @param descr The description of the agent capability.
     * @param callback The callback function to handle completion.
     */
    addAgentCaps(oid: string, descr: string, callback: Callback<void>): void;

    /**
     * Removes an agent capability from the master agent's sysORTable.
     * @param oid The OID of the agent capability to remove.
     * @param callback The callback function to handle completion.
     */
    removeAgentCaps(oid: string, callback: Callback<void>): void;

    /**
     * Sends a notification to the master agent.
     * @param typeOrOid The trap type or OID.
     * @param varbinds An array of varbind objects.
     * @param callback The callback function to handle completion.
     */
    notify(
      typeOrOid: string | number,
      varbinds: Varbind,
      callback: Callback<void>,
    ): void;

    /**
     * Sends a "ping" to the master agent.
     * @param callback The callback function to handle completion.
     */
    ping(callback: Callback<void>): void;

    /**
     * Emitted when the subagent's TCP socket is closed.
     * @param event The event name 'close'.
     * @param listener The callback function.
     */
    on(event: 'close', listener: () => void): this;

    /**
     * Emitted when the subagent's TCP socket emits an error.
     * @param event The event name 'error'.
     * @param listener The callback function.
     */
    on(event: 'error', listener: (error: Error) => void): this;
  }

  // =========================================================================
  // 5. Top-level Exports
  // =========================================================================

  /**
   * Creates an SNMP Session for v1 and v2c.
   * @param target The target host IP address or hostname.
   * @param community The SNMP community string.
   * @param options Optional session options.
   * @returns A new Session instance.
   */
  export function createSession(
    target: string,
    community: string,
    options?: SessionOptions,
  ): Session;

  /**
   * Creates an SNMP Session for v3.
   * @param target The target host IP address or hostname.
   * @param user The SNMPv3 user object.
   * @param options Optional session options.
   * @returns A new Session instance.
   */
  export function createV3Session(
    target: string,
    user: V3UserOptions,
    options?: SessionV3Options,
  ): Session;

  /**
   * Creates an SNMP Receiver instance.
   * @param options Receiver options.
   * @param callback The callback function to handle incoming notifications.
   * @returns A new Receiver instance.
   */
  export function createReceiver(
    options: ReceiverOptions,
    callback: Callback<Notification>,
  ): Receiver;

  /**
   * Creates an SNMP Agent instance.
   * @param options Agent options.
   * @param callback The callback function to handle incoming PDUs.
   * @param mib The Mib instance for the agent.
   * @returns A new Agent instance.
   */
  export function createAgent(
    options: AgentOptions,
    callback: Callback<any>,
    mib: Mib,
  ): Agent;

  /**
   * Creates a new Mib instance.
   * @param options Optional Mib options.
   * @returns A new Mib instance.
   */
  export function createMib(options?: { mibOptions?: any }): Mib;

  /**
   * Creates a new ModuleStore instance.
   * @param options Optional ModuleStore options.
   * @returns A new ModuleStore instance.
   */
  export function createModuleStore(options?: ModuleStoreOptions): ModuleStore;

  /**
   * Creates a new Subagent instance.
   * @param options Subagent options.
   * @returns A new Subagent instance.
   */
  export function createSubagent(options: SubagentOptions): Subagent;

  /**
   * Checks if a varbind indicates an error.
   * @param varbind The varbind object to check.
   * @returns True if the varbind has an error status, false otherwise.
   */
  export function isVarbindError(varbind: Varbind): boolean;

  /**
   * Returns the error message for a varbind error.
   * @param varbind The varbind object with an error status.
   * @returns The error message string.
   */
  export function varbindError(varbind: Varbind): string;

  // Export constants directly
  export {
    Version,
    PduType,
    ErrorStatus,
    ObjectType,
    TrapType,
    SecurityLevel,
    AuthProtocols,
    PrivProtocols,
    AgentXPduType,
    AccessControlModelType,
    AccessLevel,
    MaxAccess,
    RowStatus,
    ResponseInvalidCode,
    OidFormat,
    MibProviderType,
  };

  // Export classes directly
  export {
    Session,
    Receiver,
    Agent,
    Authorizer,
    SimpleAccessControlModel,
    Mib,
    ModuleStore,
    Forwarder,
    Subagent,
  };

  // Export custom error classes
  export {
    NetSnmpError,
    RequestFailedError,
    RequestInvalidError,
    RequestTimedOutError,
    ResponseInvalidError,
    ProcessingError,
  };
}
