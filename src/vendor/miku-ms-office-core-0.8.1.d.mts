export declare class ZipError extends Error {
	readonly code: ZipErrorCode;
	readonly path?: string;
	constructor(code: ZipErrorCode, message: string, path?: string);
}
export declare const DEFAULT_ZIP_READ_LIMITS: Readonly<ZipReadLimits>;
export declare const DEFAULT_ZIP_WRITE_LIMITS: Readonly<ZipWriteLimits>;
/** @deprecated Use readOfficePackage; retained as the same function reference for 1.x. */
export declare const readOfficePackageAsync: typeof readOfficePackage;
/** @deprecated Use readZipPackage; retained as the same function reference for 1.x. */
export declare const readZipPackageAsync: typeof readZipPackage;
export declare const textDecoder: TextDecoder;
export declare const textEncoder: TextEncoder;
export declare function asBytes(data: Uint8Array | string): Uint8Array;
export declare function buildOpcContentTypesXml(contentTypes: OpcContentTypes): string;
export declare function buildOpcRelationshipsPath(sourcePartPath: string): string;
export declare function buildOpcRelationshipsXml(relationships: OpcRelationship[]): string;
export declare function compareOpcPartPaths(a: string, b: string): number;
export declare function concatBytes(parts: Uint8Array[]): Uint8Array;
export declare function createDiagnostic(severity: DiagnosticSeverity, code: string, message: string, path?: string): OfficeDiagnostic;
export declare function decodeXmlEntities(value: string): string;
export declare function escapeXmlAttribute(value: string): string;
export declare function escapeXmlText(value: string): string;
export declare function getDefaultZipEntryTimestamp(): Date;
export declare function getZipEntry(entries: ZipEntry[], entryPath: string): ZipEntry | undefined;
export declare function getZipTextEntry(entries: ZipEntry[], entryPath: string): string | undefined;
export declare function listOfficeMediaParts(entries: ZipEntry[]): ZipEntry[];
export declare function normalizeOpcPartPath(partPath: string): OpcPartPath;
export declare function parseOpcContentTypesXml(xml: string): OpcContentTypes;
export declare function parseOpcRelationshipsXml(xml: string): OpcRelationship[];
export declare function parseXmlAttributes(tag: string): Map<string, string>;
export declare function readOfficePackage(data: Uint8Array, options?: ZipReadOptions): Promise<OfficePackage>;
export declare function readOfficePartRelationships(entries: ZipEntry[], sourcePartPath: string, options?: ReadOfficePartRelationshipsOptions): OpcRelationship[];
export declare function readUint16(data: Uint8Array, offset: number): number;
export declare function readUint32(data: Uint8Array, offset: number): number;
export declare function readZipPackage(data: Uint8Array, options?: ZipReadOptions): Promise<ZipReadResult>;
export declare function relationshipArrayToMap(relationships: OpcRelationship[]): Map<string, OpcRelationship>;
export declare function resolveOpcContentType(contentTypes: OpcContentTypes, partPath: string): string | undefined;
export declare function resolveOpcRelationshipTarget(sourcePartPath: string, target: string, targetMode?: string): string;
export declare function resolveOpcRelationships(relationships: OpcRelationship[], sourcePartPath: string): OpcRelationship[];
export declare function sanitizeXmlText(value: string): string;
export declare function upsertZipEntry(entries: ZipEntryInput[], entry: ZipEntryInput): ZipEntryInput[];
export declare function writeUint16(buffer: Uint8Array, offset: number, value: number): void;
export declare function writeUint32(buffer: Uint8Array, offset: number, value: number): void;
export declare function writeZipPackage(entries: ZipEntryInput[], options?: ZipWriteOptions): Promise<Uint8Array>;
export interface OfficeDiagnostic {
	severity: DiagnosticSeverity;
	code: string;
	message: string;
	path?: string;
}
export interface OfficePackage {
	entries: ZipEntry[];
	contentTypes?: OpcContentTypes;
	diagnostics: OfficeDiagnostic[];
}
export interface OpcContentTypeDefault {
	extension: string;
	contentType: string;
}
export interface OpcContentTypeOverride {
	partName: string;
	contentType: string;
}
export interface OpcContentTypes {
	defaults: OpcContentTypeDefault[];
	overrides: OpcContentTypeOverride[];
}
export interface OpcRelationship {
	id: string;
	type: string;
	target: string;
	targetMode?: string;
}
export interface ReadOfficePartRelationshipsOptions {
	resolveTargets?: boolean;
}
export interface ZipEntry {
	path: string;
	data: Uint8Array;
	compression: ZipCompressionMethod;
	compressedSize: number;
	uncompressedSize: number;
	crc32: number;
	modifiedAt: Date;
}
export interface ZipEntryInput {
	path: string;
	data: Uint8Array | string;
	compression?: ZipCompressionMethod;
	modifiedAt?: Date;
}
export interface ZipReadLimits {
	maxInputBytes: number;
	maxEntries: number;
	maxEntryBytes: number;
	maxTotalBytes: number;
}
export interface ZipReadOptions {
	limits?: Partial<ZipReadLimits>;
	signal?: AbortSignal;
}
export interface ZipReadResult {
	entries: ZipEntry[];
	diagnostics: OfficeDiagnostic[];
}
export interface ZipWriteLimits {
	maxEntries: number;
	maxEntryBytes: number;
	maxTotalBytes: number;
	maxOutputBytes: number;
}
export interface ZipWriteOptions {
	timestamp?: Date;
	compression?: ZipCompressionMethod;
	order?: "stable" | "input";
	limits?: Partial<ZipWriteLimits>;
	signal?: AbortSignal;
}
export type DiagnosticSeverity = "info" | "warning" | "error";
export type OpcPartPath = string;
export type ZipCompressionMethod = "store" | "deflate";
export type ZipErrorCode = "zip.eocd.missing" | "zip.central_directory.invalid" | "zip.local_header.invalid" | "zip.compression.unsupported" | "zip.feature.unsupported" | "zip.path.invalid" | "zip.path.duplicate" | "zip.entry.read_failed" | "zip.entry.size_mismatch" | "zip.entry.crc_mismatch" | "zip.limit.exceeded" | "zip.runtime.unsupported" | "zip.options.invalid";

export {};

