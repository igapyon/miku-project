var __mikuMsOfficeCoreRelease = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var stdin_exports = {};
  __export(stdin_exports, {
    DEFAULT_ZIP_READ_LIMITS: () => DEFAULT_ZIP_READ_LIMITS,
    DEFAULT_ZIP_WRITE_LIMITS: () => DEFAULT_ZIP_WRITE_LIMITS,
    ZipError: () => ZipError,
    asBytes: () => asBytes,
    buildOpcContentTypesXml: () => buildOpcContentTypesXml,
    buildOpcRelationshipsPath: () => buildOpcRelationshipsPath,
    buildOpcRelationshipsXml: () => buildOpcRelationshipsXml,
    compareOpcPartPaths: () => compareOpcPartPaths,
    concatBytes: () => concatBytes,
    createDiagnostic: () => createDiagnostic,
    decodeXmlEntities: () => decodeXmlEntities,
    escapeXmlAttribute: () => escapeXmlAttribute,
    escapeXmlText: () => escapeXmlText,
    getDefaultZipEntryTimestamp: () => getDefaultZipEntryTimestamp,
    getZipEntry: () => getZipEntry,
    getZipTextEntry: () => getZipTextEntry,
    listOfficeMediaParts: () => listOfficeMediaParts,
    normalizeOpcPartPath: () => normalizeOpcPartPath,
    parseOpcContentTypesXml: () => parseOpcContentTypesXml,
    parseOpcRelationshipsXml: () => parseOpcRelationshipsXml,
    parseXmlAttributes: () => parseXmlAttributes,
    readOfficePackage: () => readOfficePackage,
    readOfficePackageAsync: () => readOfficePackageAsync,
    readOfficePartRelationships: () => readOfficePartRelationships,
    readUint16: () => readUint16,
    readUint32: () => readUint32,
    readZipPackage: () => readZipPackage,
    readZipPackageAsync: () => readZipPackageAsync,
    relationshipArrayToMap: () => relationshipArrayToMap,
    resolveOpcContentType: () => resolveOpcContentType,
    resolveOpcRelationshipTarget: () => resolveOpcRelationshipTarget,
    resolveOpcRelationships: () => resolveOpcRelationships,
    sanitizeXmlText: () => sanitizeXmlText,
    textDecoder: () => textDecoder,
    textEncoder: () => textEncoder,
    upsertZipEntry: () => upsertZipEntry,
    writeUint16: () => writeUint16,
    writeUint32: () => writeUint32,
    writeZipPackage: () => writeZipPackage
  });
  var textEncoder = new TextEncoder();
  var textDecoder = new TextDecoder();
  function readUint16(data, offset) {
    return data[offset] | data[offset + 1] << 8;
  }
  function readUint32(data, offset) {
    return (data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24) >>> 0;
  }
  function writeUint16(buffer, offset, value) {
    buffer[offset] = value & 255;
    buffer[offset + 1] = value >>> 8 & 255;
  }
  function writeUint32(buffer, offset, value) {
    buffer[offset] = value & 255;
    buffer[offset + 1] = value >>> 8 & 255;
    buffer[offset + 2] = value >>> 16 & 255;
    buffer[offset + 3] = value >>> 24 & 255;
  }
  function concatBytes(parts) {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const output = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      output.set(part, offset);
      offset += part.length;
    }
    return output;
  }
  function asBytes(data) {
    return typeof data === "string" ? textEncoder.encode(data) : data;
  }
  function createDiagnostic(severity, code, message, path) {
    return path === void 0 ? { severity, code, message } : { severity, code, message, path };
  }
  function normalizeOpcPartPath(partPath) {
    var _a;
    const withoutHash = (_a = partPath.split("#", 1)[0]) != null ? _a : "";
    const raw = withoutHash.replace(/\\/g, "/").replace(/^\/+/, "");
    const parts = [];
    for (const part of raw.split("/")) {
      if (part === "" || part === ".") {
        continue;
      }
      if (part === "..") {
        if (parts.length === 0) {
          throw new Error(`OPC part path escapes package root: ${partPath}`);
        }
        parts.pop();
        continue;
      }
      parts.push(part);
    }
    if (parts.length === 0) {
      throw new Error(`OPC part path is empty: ${partPath}`);
    }
    return parts.join("/");
  }
  function resolveOpcRelationshipTarget(sourcePartPath, target, targetMode = "") {
    if (targetMode.toLowerCase() === "external") {
      return target;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) {
      return target;
    }
    if (target.startsWith("/")) {
      return normalizeOpcPartPath(target);
    }
    const source = normalizeOpcPartPath(sourcePartPath);
    const sourceDirectory = source.includes("/") ? source.slice(0, source.lastIndexOf("/")) : "";
    return normalizeOpcPartPath(sourceDirectory === "" ? target : `${sourceDirectory}/${target}`);
  }
  function compareOpcPartPaths(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  function buildOpcRelationshipsPath(sourcePartPath) {
    const source = normalizeOpcPartPath(sourcePartPath);
    const slashIndex = source.lastIndexOf("/");
    const directory = slashIndex < 0 ? "" : source.slice(0, slashIndex);
    const fileName = slashIndex < 0 ? source : source.slice(slashIndex + 1);
    return directory === "" ? `_rels/${fileName}.rels` : `${directory}/_rels/${fileName}.rels`;
  }
  function escapeXmlText(value) {
    return sanitizeXmlText(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escapeXmlAttribute(value) {
    return escapeXmlText(value).replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  function sanitizeXmlText(value) {
    return value.replace(
      /[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu,
      ""
    );
  }
  function parseXmlAttributes(tag) {
    var _a, _b;
    const attributes = /* @__PURE__ */ new Map();
    const pattern = /([A-Za-z_][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    for (const match of tag.matchAll(pattern)) {
      attributes.set(match[1], decodeXmlEntities((_b = (_a = match[2]) != null ? _a : match[3]) != null ? _b : ""));
    }
    return attributes;
  }
  function decodeXmlEntities(value) {
    return value.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  }
  function parseOpcContentTypesXml(xml) {
    var _a, _b;
    const defaults = [];
    const overrides = [];
    for (const match of xml.matchAll(/<Default\b([^>]*)\/?>/g)) {
      const attributes = parseXmlAttributes((_a = match[1]) != null ? _a : "");
      const extension = attributes.get("Extension");
      const contentType = attributes.get("ContentType");
      if (extension !== void 0 && contentType !== void 0) {
        defaults.push({ extension, contentType });
      }
    }
    for (const match of xml.matchAll(/<Override\b([^>]*)\/?>/g)) {
      const attributes = parseXmlAttributes((_b = match[1]) != null ? _b : "");
      const partName = attributes.get("PartName");
      const contentType = attributes.get("ContentType");
      if (partName !== void 0 && contentType !== void 0) {
        overrides.push({ partName: normalizeOpcPartPath(partName), contentType });
      }
    }
    return { defaults, overrides };
  }
  function resolveOpcContentType(contentTypes, partPath) {
    var _a;
    const normalized = normalizeOpcPartPath(partPath);
    const override = contentTypes.overrides.find((item) => item.partName === normalized);
    if (override !== void 0) {
      return override.contentType;
    }
    const extension = normalized.includes(".") ? normalized.slice(normalized.lastIndexOf(".") + 1) : "";
    return (_a = contentTypes.defaults.find((item) => item.extension === extension)) == null ? void 0 : _a.contentType;
  }
  function buildOpcContentTypesXml(contentTypes) {
    const defaults = contentTypes.defaults.map((item) => `<Default Extension="${escapeXmlAttribute(item.extension)}" ContentType="${escapeXmlAttribute(item.contentType)}"/>`).join("");
    const overrides = contentTypes.overrides.map((item) => `<Override PartName="/${escapeXmlAttribute(normalizeOpcPartPath(item.partName))}" ContentType="${escapeXmlAttribute(item.contentType)}"/>`).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">${defaults}${overrides}</Types>`;
  }
  function parseOpcRelationshipsXml(xml) {
    var _a;
    const relationships = [];
    const pattern = /<Relationship\b([^>]*)\/?>/g;
    for (const match of xml.matchAll(pattern)) {
      const attributes = parseXmlAttributes((_a = match[1]) != null ? _a : "");
      const id = attributes.get("Id");
      const type = attributes.get("Type");
      const target = attributes.get("Target");
      if (id === void 0 || type === void 0 || target === void 0) {
        continue;
      }
      const targetMode = attributes.get("TargetMode");
      relationships.push(
        targetMode === void 0 ? { id, type, target } : { id, type, target, targetMode }
      );
    }
    return relationships;
  }
  function buildOpcRelationshipsXml(relationships) {
    const rels = relationships.map((relationship) => {
      const targetMode = relationship.targetMode === void 0 ? "" : ` TargetMode="${escapeXmlAttribute(relationship.targetMode)}"`;
      return `<Relationship Id="${escapeXmlAttribute(relationship.id)}" Type="${escapeXmlAttribute(relationship.type)}" Target="${escapeXmlAttribute(relationship.target)}"${targetMode}/>`;
    }).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`;
  }
  function resolveOpcRelationships(relationships, sourcePartPath) {
    return relationships.map((relationship) => ({
      ...relationship,
      target: resolveOpcRelationshipTarget(sourcePartPath, relationship.target, relationship.targetMode)
    }));
  }
  function relationshipArrayToMap(relationships) {
    return new Map(relationships.map((relationship) => [relationship.id, relationship]));
  }
  var crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    }
    crcTable[i] = c >>> 0;
  }
  function crc32(data) {
    let crc = 4294967295;
    for (const value of data) {
      crc = crcTable[(crc ^ value) & 255] ^ crc >>> 8;
    }
    return (crc ^ 4294967295) >>> 0;
  }
  var ZipError = class extends Error {
    constructor(code, message, path) {
      super(message);
      __publicField(this, "code");
      __publicField(this, "path");
      this.name = "ZipError";
      this.code = code;
      if (path !== void 0) {
        this.path = path;
      }
    }
  };
  var STREAM_CHUNK_BYTES = 64 * 1024;
  async function deflateRawBytes(data, maxOutputBytes, signal) {
    return transformRawBytes(data, "compress", maxOutputBytes, signal);
  }
  async function inflateRawBytes(data, maxOutputBytes, expectedSize, path, signal) {
    return transformRawBytes(data, "decompress", maxOutputBytes, signal, path, expectedSize);
  }
  async function transformRawBytes(data, direction, maxOutputBytes, signal, path, expectedSize) {
    if (!Number.isSafeInteger(maxOutputBytes) || maxOutputBytes < 0) {
      throw new ZipError("zip.options.invalid", "The ZIP stream output limit must be a non-negative safe integer.");
    }
    throwIfAborted(signal);
    const runtime = globalThis;
    const Constructor = direction === "compress" ? runtime.CompressionStream : runtime.DecompressionStream;
    if (typeof Constructor !== "function" || typeof globalThis.ReadableStream !== "function") {
      throw unsupportedRuntime(direction);
    }
    let transform;
    try {
      transform = new Constructor("deflate-raw");
    } catch (error) {
      if (error instanceof TypeError || error instanceof Error && error.name === "NotSupportedError") {
        throw unsupportedRuntime(direction);
      }
      throw error;
    }
    const source = makeByteStream(data);
    const reader = transform.readable.getReader();
    const controller = new AbortController();
    const chunks = [];
    let total = 0;
    const onAbort = () => controller.abort(createAbortError());
    signal == null ? void 0 : signal.addEventListener("abort", onAbort, { once: true });
    const piping = source.pipeTo(
      transform.writable,
      { signal: controller.signal }
    );
    try {
      while (true) {
        throwIfAborted(signal);
        const result = await reader.read();
        throwIfAborted(signal);
        if (result.done) {
          break;
        }
        const nextTotal = total + result.value.byteLength;
        if (!Number.isSafeInteger(nextTotal) || nextTotal > maxOutputBytes) {
          throw new ZipError("zip.limit.exceeded", "ZIP stream output exceeds the configured limit.", path);
        }
        if (expectedSize !== void 0 && nextTotal > expectedSize) {
          throw new ZipError("zip.entry.size_mismatch", `ZIP entry size mismatch: ${path}`, path);
        }
        total = nextTotal;
        chunks.push(new Uint8Array(result.value));
      }
      await piping;
      throwIfAborted(signal);
      if (expectedSize !== void 0 && total !== expectedSize) {
        throw new ZipError("zip.entry.size_mismatch", `ZIP entry size mismatch: ${path}`, path);
      }
    } catch (error) {
      controller.abort(error);
      try {
        await reader.cancel(error);
      } catch (_cancelError) {
      }
      await piping.catch(() => void 0);
      if (signal == null ? void 0 : signal.aborted) {
        throw createAbortError();
      }
      if (direction === "decompress" && !(error instanceof ZipError)) {
        throw new ZipError("zip.entry.read_failed", `Unable to inflate ZIP entry${path === void 0 ? "" : `: ${path}`}`, path);
      }
      throw error;
    } finally {
      signal == null ? void 0 : signal.removeEventListener("abort", onAbort);
      try {
        reader.releaseLock();
      } catch (_releaseError) {
      }
    }
    const output = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      output.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return output;
  }
  function makeByteStream(data) {
    let offset = 0;
    return new ReadableStream({
      pull(controller) {
        if (offset >= data.byteLength) {
          controller.close();
          return;
        }
        const end = Math.min(offset + STREAM_CHUNK_BYTES, data.byteLength);
        controller.enqueue(data.subarray(offset, end));
        offset = end;
      }
    });
  }
  function throwIfAborted(signal) {
    if (signal == null ? void 0 : signal.aborted) {
      throw createAbortError();
    }
  }
  function createAbortError() {
    return new DOMException("The ZIP operation was aborted.", "AbortError");
  }
  function unsupportedRuntime(direction) {
    const operation = direction === "compress" ? "CompressionStream" : "DecompressionStream";
    return new ZipError("zip.runtime.unsupported", `${operation}("deflate-raw") is not available in this runtime.`);
  }
  var EOCD_SIGNATURE = 101010256;
  var CENTRAL_DIRECTORY_SIGNATURE = 33639248;
  var LOCAL_FILE_SIGNATURE = 67324752;
  var ZIP64_EOCD_LOCATOR_SIGNATURE = 117853008;
  var ZIP_GENERAL_PURPOSE_FLAG_UTF8 = 2048;
  function readCentralDirectory(data, diagnostics, maxEntries) {
    const eocdOffset = findEndOfCentralDirectory(data);
    if (eocdOffset < 0) {
      diagnostics.push(createDiagnostic("error", "zip.eocd.missing", "End of central directory was not found."));
      return [];
    }
    if (!rangeFits(data, eocdOffset, 22)) return centralFailure(diagnostics, "zip.central_directory.invalid", "End of central directory is truncated.");
    if (eocdOffset >= 20 && readUint32(data, eocdOffset - 20) === ZIP64_EOCD_LOCATOR_SIGNATURE) {
      return centralFailure(diagnostics, "zip.feature.unsupported", "ZIP64 archives are not supported.");
    }
    const diskNumber = readUint16(data, eocdOffset + 4);
    const centralDiskNumber = readUint16(data, eocdOffset + 6);
    const entriesOnDisk = readUint16(data, eocdOffset + 8);
    const entryCount = readUint16(data, eocdOffset + 10);
    const centralDirectorySize = readUint32(data, eocdOffset + 12);
    const centralDirectoryOffset = readUint32(data, eocdOffset + 16);
    if (diskNumber !== 0 || centralDiskNumber !== 0 || entriesOnDisk !== entryCount) {
      return centralFailure(diagnostics, "zip.feature.unsupported", "Multi-disk ZIP archives are not supported.");
    }
    if (entryCount === 65535 || centralDirectorySize === 4294967295 || centralDirectoryOffset === 4294967295) {
      return centralFailure(diagnostics, "zip.feature.unsupported", "ZIP64 archives are not supported.");
    }
    if (entryCount > maxEntries) return centralFailure(diagnostics, "zip.limit.exceeded", "ZIP entry count exceeds the configured limit.");
    if (centralDirectoryOffset + centralDirectorySize !== eocdOffset || !rangeFits(data, centralDirectoryOffset, centralDirectorySize)) {
      return centralFailure(diagnostics, "zip.central_directory.invalid", "Central directory bounds do not match the end record.");
    }
    const entries = [];
    const seenPaths = /* @__PURE__ */ new Set();
    let offset = centralDirectoryOffset;
    for (let index = 0; index < entryCount; index += 1) {
      if (!rangeFits(data, offset, 46) || offset + 46 > eocdOffset || readUint32(data, offset) !== CENTRAL_DIRECTORY_SIGNATURE) {
        return centralFailure(diagnostics, "zip.central_directory.invalid", "Central directory entry is missing or truncated.");
      }
      const flags = readUint16(data, offset + 8);
      const method = readUint16(data, offset + 10);
      const time = readUint16(data, offset + 12);
      const date = readUint16(data, offset + 14);
      const crc = readUint32(data, offset + 16);
      const compressedSize = readUint32(data, offset + 20);
      const uncompressedSize = readUint32(data, offset + 24);
      const fileNameLength = readUint16(data, offset + 28);
      const extraLength = readUint16(data, offset + 30);
      const commentLength = readUint16(data, offset + 32);
      const diskStart = readUint16(data, offset + 34);
      const localHeaderOffset = readUint32(data, offset + 42);
      const nameStart = offset + 46;
      const variableLength = fileNameLength + extraLength + commentLength;
      if (!rangeFits(data, nameStart, variableLength) || nameStart + variableLength > eocdOffset) {
        return centralFailure(diagnostics, "zip.central_directory.invalid", "Central directory variable fields are truncated.");
      }
      if (diskStart === 65535 || compressedSize === 4294967295 || uncompressedSize === 4294967295 || localHeaderOffset === 4294967295) {
        return centralFailure(diagnostics, "zip.feature.unsupported", "ZIP64 central directory values are not supported.");
      }
      if (diskStart !== 0) return centralFailure(diagnostics, "zip.feature.unsupported", "Multi-disk ZIP entries are not supported.");
      if ((flags & 1) !== 0 || (flags & 64) !== 0) return centralFailure(diagnostics, "zip.feature.unsupported", "Encrypted ZIP entries are not supported.");
      const allowedFlags = ZIP_GENERAL_PURPOSE_FLAG_UTF8 | 8 | (method === 8 ? 6 : 0);
      if ((flags & ~allowedFlags) !== 0) return centralFailure(diagnostics, "zip.feature.unsupported", "ZIP entry uses unsupported general purpose flags.");
      if (method !== 0 && method !== 8) return centralFailure(diagnostics, "zip.compression.unsupported", `Unsupported ZIP compression method: ${method}`);
      const fileNameBytes = data.slice(nameStart, nameStart + fileNameLength);
      let decodedPath;
      try {
        decodedPath = decodeZipPath(fileNameBytes, (flags & ZIP_GENERAL_PURPOSE_FLAG_UTF8) !== 0);
        inspectExtraFields(data.subarray(nameStart + fileNameLength, nameStart + fileNameLength + extraLength), void 0, "zip.central_directory.invalid");
      } catch (error) {
        const code = error instanceof ZipError ? error.code : "zip.path.invalid";
        return centralFailure(diagnostics, code, error instanceof Error ? error.message : String(error));
      }
      const isDirectory = decodedPath.endsWith("/");
      let path;
      try {
        if (decodedPath.startsWith("/") || decodedPath.startsWith("\\")) throw new Error("ZIP entry path must be relative.");
        path = normalizeOpcPartPath(decodedPath);
      } catch (error) {
        return centralFailure(diagnostics, "zip.path.invalid", error instanceof Error ? error.message : String(error));
      }
      const duplicateKey = `${isDirectory ? "directory" : "file"}:${path}`;
      if (seenPaths.has(duplicateKey)) return centralFailure(diagnostics, "zip.path.duplicate", `Duplicate ZIP entry path: ${path}`, path);
      seenPaths.add(duplicateKey);
      if (method === 0 && compressedSize !== uncompressedSize) return centralFailure(diagnostics, "zip.entry.size_mismatch", `Stored ZIP entry sizes disagree: ${path}`, path);
      entries.push({
        path,
        fileNameBytes,
        method,
        flags,
        crc,
        compressedSize,
        uncompressedSize,
        localHeaderOffset,
        centralDirectoryOffset,
        payloadStart: 0,
        payloadEnd: 0,
        localRecordEnd: 0,
        modifiedAt: fromDosDateTime(date, time),
        isDirectory
      });
      offset = nameStart + variableLength;
    }
    if (offset !== eocdOffset) return centralFailure(diagnostics, "zip.central_directory.invalid", "Central directory contains trailing records or bytes.");
    try {
      const ranges = [];
      for (const entry of entries) {
        readZipEntryCompressedData(data, entry);
        ranges.push({ start: entry.localHeaderOffset, end: entry.localRecordEnd, path: entry.path });
      }
      ranges.sort((a, b) => a.start - b.start);
      for (let index = 1; index < ranges.length; index += 1) {
        if (ranges[index - 1].end > ranges[index].start) {
          return centralFailure(diagnostics, "zip.local_header.invalid", `ZIP local records overlap: ${ranges[index].path}`, ranges[index].path);
        }
      }
    } catch (error) {
      const code = error instanceof ZipError ? error.code : "zip.local_header.invalid";
      return centralFailure(diagnostics, code, error instanceof Error ? error.message : String(error), error instanceof ZipError ? error.path : void 0);
    }
    return entries;
  }
  function readZipEntryCompressedData(data, central) {
    const offset = central.localHeaderOffset;
    if (!rangeFits(data, offset, 30) || readUint32(data, offset) !== LOCAL_FILE_SIGNATURE) {
      throw new ZipError("zip.local_header.invalid", "ZIP local file header is missing or truncated.", central.path);
    }
    const flags = readUint16(data, offset + 6);
    const method = readUint16(data, offset + 8);
    const localCrc = readUint32(data, offset + 14);
    const localCompressedSize = readUint32(data, offset + 18);
    const localUncompressedSize = readUint32(data, offset + 22);
    const nameLength = readUint16(data, offset + 26);
    const extraLength = readUint16(data, offset + 28);
    const nameStart = offset + 30;
    const extraStart = nameStart + nameLength;
    const payloadStart = extraStart + extraLength;
    const payloadEnd = payloadStart + central.compressedSize;
    if (localCompressedSize === 4294967295 || localUncompressedSize === 4294967295) throw new ZipError("zip.feature.unsupported", "ZIP64 local header values are not supported.", central.path);
    if (!rangeFits(data, nameStart, nameLength + extraLength) || !rangeFits(data, payloadStart, central.compressedSize)) {
      throw new ZipError("zip.local_header.invalid", "ZIP local header or entry data is outside the input range.", central.path);
    }
    const localName = data.subarray(nameStart, extraStart);
    const descriptor = (central.flags & 8) !== 0;
    if (flags !== central.flags || method !== central.method || !bytesEqual(localName, central.fileNameBytes)) {
      throw new ZipError("zip.local_header.invalid", "ZIP local and central headers disagree.", central.path);
    }
    inspectExtraFields(data.subarray(extraStart, payloadStart), central.path);
    if (descriptor) {
      if (localCrc !== 0 && localCrc !== central.crc || localCompressedSize !== 0 && localCompressedSize !== central.compressedSize || localUncompressedSize !== 0 && localUncompressedSize !== central.uncompressedSize) {
        throw new ZipError("zip.local_header.invalid", "ZIP descriptor local header has conflicting values.", central.path);
      }
    } else if (localCrc !== central.crc || localCompressedSize !== central.compressedSize || localUncompressedSize !== central.uncompressedSize) {
      throw new ZipError("zip.local_header.invalid", "ZIP local and central sizes or CRC disagree.", central.path);
    }
    if (payloadEnd > central.centralDirectoryOffset) throw new ZipError("zip.local_header.invalid", "ZIP entry data overlaps the central directory.", central.path);
    let recordEnd = payloadEnd;
    if (descriptor) recordEnd += validateDataDescriptor(data, payloadEnd, central);
    central.payloadStart = payloadStart;
    central.payloadEnd = payloadEnd;
    central.localRecordEnd = recordEnd;
    if (recordEnd > central.centralDirectoryOffset) throw new ZipError("zip.local_header.invalid", "ZIP data descriptor overlaps the central directory.", central.path);
    return data.subarray(payloadStart, payloadEnd);
  }
  function findEndOfCentralDirectory(data) {
    const minOffset = Math.max(0, data.length - 65535 - 22);
    for (let offset = data.length - 22; offset >= minOffset; offset -= 1) {
      if (rangeFits(data, offset, 22) && readUint32(data, offset) === EOCD_SIGNATURE) {
        const commentLength = readUint16(data, offset + 20);
        if (offset + 22 + commentLength !== data.length) continue;
        const directorySize = readUint32(data, offset + 12);
        const directoryOffset = readUint32(data, offset + 16);
        if (directorySize !== 4294967295 && directoryOffset !== 4294967295 && directoryOffset + directorySize !== offset) continue;
        return offset;
      }
    }
    return -1;
  }
  function fromDosDateTime(date, time) {
    const year = 1980 + (date >>> 9 & 127);
    const month = date >>> 5 & 15;
    const day = date & 31;
    const hour = time >>> 11 & 31;
    const minute = time >>> 5 & 63;
    const second = (time & 31) * 2;
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  }
  function centralFailure(diagnostics, code, message, path) {
    diagnostics.push(createDiagnostic("error", code, message, path));
    return [];
  }
  function rangeFits(data, offset, length) {
    return Number.isSafeInteger(offset) && Number.isSafeInteger(length) && offset >= 0 && length >= 0 && offset + length <= data.byteLength;
  }
  function decodeZipPath(bytes, utf8) {
    if (!utf8 && bytes.some((value) => value > 127)) throw new ZipError("zip.feature.unsupported", "ZIP filename is not flagged as UTF-8 and contains non-ASCII bytes.");
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch (_error) {
      throw new ZipError("zip.path.invalid", "ZIP filename is not valid UTF-8.");
    }
  }
  function inspectExtraFields(bytes, path, malformedCode = "zip.local_header.invalid") {
    let offset = 0;
    while (offset < bytes.length) {
      if (!rangeFits(bytes, offset, 4)) throw new ZipError(malformedCode, "ZIP extra field header is truncated.", path);
      const id = readUint16(bytes, offset);
      const length = readUint16(bytes, offset + 2);
      offset += 4;
      if (!rangeFits(bytes, offset, length)) throw new ZipError(malformedCode, "ZIP extra field data is truncated.", path);
      if (id === 1) throw new ZipError("zip.feature.unsupported", "ZIP64 extra fields are not supported.", path);
      offset += length;
    }
  }
  function validateDataDescriptor(data, offset, central) {
    if (!rangeFits(data, offset, 12)) throw new ZipError("zip.local_header.invalid", "ZIP data descriptor is truncated.", central.path);
    const matches = (valueOffset) => rangeFits(data, valueOffset, 12) && readUint32(data, valueOffset) === central.crc && readUint32(data, valueOffset + 4) === central.compressedSize && readUint32(data, valueOffset + 8) === central.uncompressedSize;
    if (readUint32(data, offset) === 134695760 && rangeFits(data, offset, 16) && matches(offset + 4)) return 16;
    if (matches(offset)) return 12;
    if (!rangeFits(data, offset, 16)) throw new ZipError("zip.local_header.invalid", "ZIP data descriptor is truncated.", central.path);
    throw new ZipError("zip.local_header.invalid", "ZIP data descriptor values disagree with the central directory.", central.path);
  }
  function bytesEqual(left, right) {
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) if (left[index] !== right[index]) return false;
    return true;
  }
  var MiB = 1024 * 1024;
  var DEFAULT_ZIP_READ_LIMITS = Object.freeze({
    maxInputBytes: 64 * MiB,
    maxEntries: 1e4,
    maxEntryBytes: 64 * MiB,
    maxTotalBytes: 256 * MiB
  });
  var DEFAULT_ZIP_WRITE_LIMITS = Object.freeze({
    maxEntries: 1e4,
    maxEntryBytes: 64 * MiB,
    maxTotalBytes: 256 * MiB,
    maxOutputBytes: 256 * MiB
  });
  function validateReadArguments(data, options) {
    if (!(data instanceof Uint8Array)) throw invalidOptions("ZIP input must be a Uint8Array.");
    validateObjectKeys(options, ["limits", "signal"], "read options");
    if (options.limits !== void 0) validateLimits(options.limits, Object.keys(DEFAULT_ZIP_READ_LIMITS), "read limits");
    validateSignal(options.signal);
  }
  function validateWriteArguments(entries, options) {
    if (!Array.isArray(entries)) throw invalidOptions("ZIP entries must be an array.");
    validateObjectKeys(options, ["timestamp", "compression", "order", "limits", "signal"], "write options");
    if (options.limits !== void 0) validateLimits(options.limits, Object.keys(DEFAULT_ZIP_WRITE_LIMITS), "write limits");
    if (options.timestamp !== void 0) cloneDate(options.timestamp, "timestamp");
    if (options.compression !== void 0 && options.compression !== "store" && options.compression !== "deflate") {
      throw invalidOptions("compression must be 'store' or 'deflate'.");
    }
    if (options.order !== void 0 && options.order !== "stable" && options.order !== "input") {
      throw invalidOptions("order must be 'stable' or 'input'.");
    }
    validateSignal(options.signal);
    for (const entry of entries) validateEntryShape(entry);
  }
  function validateEntryShape(entry) {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) throw invalidOptions("Each ZIP entry must be an object.");
    validateObjectKeys(entry, ["path", "data", "compression", "modifiedAt"], "ZIP entry");
    if (typeof entry.path !== "string" || entry.path.length === 0) throw invalidOptions("Each ZIP entry path must be a non-empty string.");
    if (!(typeof entry.data === "string" || entry.data instanceof Uint8Array)) throw invalidOptions(`ZIP entry data must be a string or Uint8Array: ${entry.path}`);
    if (entry.compression !== void 0 && entry.compression !== "store" && entry.compression !== "deflate") throw invalidOptions(`Invalid ZIP compression: ${String(entry.compression)}`);
    if (entry.modifiedAt !== void 0) cloneDate(entry.modifiedAt, "modifiedAt");
  }
  function resolveLimits(defaults, partial) {
    const resolved = { ...defaults };
    if (partial !== void 0) {
      for (const [key, value] of Object.entries(partial)) {
        if (value !== void 0) resolved[key] = value;
      }
    }
    return resolved;
  }
  function cloneDate(value, label) {
    if (!(value instanceof Date) || !Number.isFinite(value.getTime())) throw invalidOptions(`${label} must be a valid Date.`);
    const date = new Date(value.getTime());
    if (date.getUTCFullYear() < 1980 || date.getUTCFullYear() > 2107) throw invalidOptions(`${label} must be within ZIP's 1980\u20132107 timestamp range.`);
    return date;
  }
  function normalizeInputPath(path) {
    try {
      return normalizeOpcPartPath(path);
    } catch (error) {
      throw new ZipError("zip.path.invalid", error instanceof Error ? error.message : String(error), path);
    }
  }
  function entryByteLength(data) {
    if (data instanceof Uint8Array) return data.byteLength;
    let size = 0;
    for (let index = 0; index < data.length; index += 1) {
      const code = data.charCodeAt(index);
      if (code <= 127) size += 1;
      else if (code <= 2047) size += 2;
      else if (code >= 55296 && code <= 56319 && index + 1 < data.length && data.charCodeAt(index + 1) >= 56320 && data.charCodeAt(index + 1) <= 57343) {
        size += 4;
        index += 1;
      } else size += 3;
    }
    return size;
  }
  function snapshotEntryBytes(data, byteLength) {
    if (typeof data !== "string") return new Uint8Array(data);
    const output = new Uint8Array(byteLength);
    const result = textEncoder.encodeInto(data, output);
    if (result.read !== data.length || result.written !== byteLength) throw invalidOptions("Unable to encode ZIP entry data.");
    return output;
  }
  function validateObjectKeys(value, allowedKeys, label) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) throw invalidOptions(`${label} must be an object.`);
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== "string" || !allowedKeys.includes(key)) throw invalidOptions(`Unknown ${label} key: ${String(key)}`);
    }
  }
  function validateLimits(limits, allowedKeys, label) {
    validateObjectKeys(limits, allowedKeys, label);
    for (const [key, value] of Object.entries(limits)) {
      if (value === void 0) continue;
      if (!Number.isSafeInteger(value) || value < 0) throw invalidOptions(`${label}.${key} must be a non-negative safe integer.`);
    }
  }
  function validateSignal(signal) {
    if (signal === void 0) return;
    if (signal === null || typeof signal !== "object" || typeof signal.aborted !== "boolean" || typeof signal.addEventListener !== "function" || typeof signal.removeEventListener !== "function") {
      throw invalidOptions("signal must be an AbortSignal.");
    }
  }
  function invalidOptions(message) {
    return new ZipError("zip.options.invalid", message);
  }
  var EOCD_SIGNATURE2 = 101010256;
  var CENTRAL_DIRECTORY_SIGNATURE2 = 33639248;
  var LOCAL_FILE_SIGNATURE2 = 67324752;
  var ZIP_GENERAL_PURPOSE_FLAG_UTF82 = 2048;
  var FIXED_TIMESTAMP = new Date(Date.UTC(1980, 0, 1, 0, 0, 0));
  function getDefaultZipEntryTimestamp() {
    return new Date(FIXED_TIMESTAMP.getTime());
  }
  async function readZipPackage(data, options = {}) {
    validateReadArguments(data, options);
    const limits = resolveLimits(DEFAULT_ZIP_READ_LIMITS, options.limits);
    const signal = options.signal;
    throwIfAborted2(signal);
    if (data.byteLength > limits.maxInputBytes) {
      return zipFailure("zip.limit.exceeded", "ZIP input exceeds the configured limit.");
    }
    const snapshot = new Uint8Array(data);
    const diagnostics = [];
    const entries = [];
    const centralDirectory = readCentralDirectory(snapshot, diagnostics, limits.maxEntries);
    if (diagnostics.length > 0) return { entries: [], diagnostics };
    if (centralDirectory.length > limits.maxEntries) return zipFailure("zip.limit.exceeded", "ZIP entry count exceeds the configured limit.");
    let declaredTotal = 0;
    for (const central of centralDirectory) {
      if (central.uncompressedSize > limits.maxEntryBytes) return zipFailure("zip.limit.exceeded", "ZIP entry exceeds the configured limit.", central.path);
      declaredTotal += central.uncompressedSize;
      if (!Number.isSafeInteger(declaredTotal) || declaredTotal > limits.maxTotalBytes) {
        return zipFailure("zip.limit.exceeded", "ZIP total uncompressed size exceeds the configured limit.", central.path);
      }
    }
    let actualTotal = 0;
    for (const central of centralDirectory) {
      throwIfAborted2(signal);
      try {
        const compressed = readZipEntryCompressedData(snapshot, central);
        const entryData = central.method === 0 ? new Uint8Array(compressed) : await inflateRawBytes(compressed, Math.min(limits.maxEntryBytes, limits.maxTotalBytes - actualTotal), central.uncompressedSize, central.path, signal);
        throwIfAborted2(signal);
        if (entryData.byteLength !== central.uncompressedSize) {
          return zipFailure("zip.entry.size_mismatch", `ZIP entry size mismatch: ${central.path}`, central.path);
        }
        if (crc32(entryData) !== central.crc) {
          return zipFailure("zip.entry.crc_mismatch", `ZIP entry CRC mismatch: ${central.path}`, central.path);
        }
        actualTotal += entryData.byteLength;
        if (!central.isDirectory) entries.push(buildZipEntry(central, entryData));
      } catch (error) {
        if (isAbortError(error)) throw abortError();
        if (!(error instanceof ZipError)) throw error;
        if (error.code === "zip.runtime.unsupported") throw error;
        diagnostics.push(
          createDiagnostic(
            "error",
            error.code,
            error.message,
            central.path
          )
        );
        return { entries: [], diagnostics };
      }
    }
    return { entries, diagnostics };
  }
  var readZipPackageAsync = readZipPackage;
  async function writeZipPackage(entries, options = {}) {
    var _a;
    validateWriteArguments(entries, options);
    const limits = resolveLimits(DEFAULT_ZIP_WRITE_LIMITS, options.limits);
    const signal = options.signal;
    throwIfAborted2(signal);
    const timestamp = options.timestamp === void 0 ? FIXED_TIMESTAMP : cloneDate(options.timestamp, "timestamp");
    const order = (_a = options.order) != null ? _a : "stable";
    const prepared = snapshotWriteEntries(entries, options, timestamp, limits);
    if (order === "stable") {
      prepared.sort((a, b) => compareOpcPartPaths(a.path, b.path));
    }
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    let centralSize = 0;
    for (const entry of prepared) {
      throwIfAborted2(signal);
      const nameLength = textEncoder.encode(entry.path).byteLength;
      const remainingCompressedBudget = limits.maxOutputBytes - offset - centralSize - (30 + nameLength) - (46 + nameLength) - 22;
      if (remainingCompressedBudget < 0 || offset > 4294967294) throw new ZipError("zip.limit.exceeded", "ZIP output exceeds the configured ZIP32/output limit.", entry.path);
      const serialized = await serializeZipEntry(entry, offset, remainingCompressedBudget, signal);
      throwIfAborted2(signal);
      if (serialized.compressed.length > 4294967294 || entry.data.length > 4294967294) throw new ZipError("zip.limit.exceeded", "ZIP entry exceeds ZIP32 size limits.", entry.path);
      localParts.push(serialized.localHeader, serialized.compressed);
      centralParts.push(serialized.centralHeader);
      offset += serialized.localHeader.length + serialized.compressed.length;
      centralSize += serialized.centralHeader.length;
      if (offset + centralSize + 22 > limits.maxOutputBytes) {
        throw new ZipError("zip.limit.exceeded", "ZIP output exceeds the configured limit.");
      }
    }
    if (offset + centralSize + 22 > limits.maxOutputBytes) throw new ZipError("zip.limit.exceeded", "ZIP output exceeds the configured limit.");
    const centralDirectory = concatBytes(centralParts);
    if (centralDirectory.length > 4294967294 || offset > 4294967294) throw new ZipError("zip.limit.exceeded", "ZIP central directory exceeds ZIP32 limits.");
    const end = buildEndOfCentralDirectory(prepared.length, centralDirectory.length, offset);
    return concatBytes([...localParts, centralDirectory, end]);
  }
  function getZipEntry(entries, entryPath) {
    const normalized = normalizeOpcPartPath(entryPath);
    return entries.find((entry) => entry.path === normalized);
  }
  function getZipTextEntry(entries, entryPath) {
    const entry = getZipEntry(entries, entryPath);
    return entry === void 0 ? void 0 : textDecoder.decode(entry.data);
  }
  function upsertZipEntry(entries, entry) {
    const normalized = normalizeOpcPartPath(entry.path);
    const next = entries.filter((item) => normalizeOpcPartPath(item.path) !== normalized);
    next.push({ ...entry, path: normalized });
    return next;
  }
  function snapshotWriteEntries(entries, options, timestamp, limits) {
    var _a, _b;
    const compression = (_a = options.compression) != null ? _a : "store";
    if (entries.length > limits.maxEntries || entries.length > 65534) throw new ZipError("zip.limit.exceeded", "ZIP entry count exceeds the configured ZIP32/output limit.");
    const pending = [];
    const paths = /* @__PURE__ */ new Set();
    let total = 0;
    for (const input of entries) {
      validateEntryShape(input);
      if (entryByteLength(input.path) > 65535) throw new ZipError("zip.limit.exceeded", "ZIP entry name exceeds ZIP32 limits.", input.path);
      if (input.path.startsWith("/") || input.path.startsWith("\\")) {
        throw new ZipError("zip.path.invalid", "ZIP entry path must be relative.", input.path);
      }
      const path = normalizeInputPath(input.path);
      if (input.path.endsWith("/") || input.path.endsWith("\\")) throw new ZipError("zip.path.invalid", "The ZIP writer accepts file entries only.", input.path);
      const nameLength = entryByteLength(path);
      if (nameLength === 0 || nameLength > 65535) throw new ZipError("zip.limit.exceeded", "ZIP entry name exceeds ZIP32 limits.", path);
      if (paths.has(path)) throw new ZipError("zip.path.duplicate", `Duplicate ZIP entry path: ${path}`, path);
      paths.add(path);
      const entryCompression = (_b = input.compression) != null ? _b : compression;
      if (entryCompression !== "store" && entryCompression !== "deflate") {
        throw new ZipError("zip.options.invalid", `Unsupported ZIP compression: ${String(entryCompression)}`, path);
      }
      const byteLength = entryByteLength(input.data);
      if (byteLength > 4294967294) throw new ZipError("zip.limit.exceeded", "ZIP entry exceeds ZIP32 size limits.", path);
      if (byteLength > limits.maxEntryBytes) throw new ZipError("zip.limit.exceeded", "ZIP entry exceeds the configured limit.", path);
      total += byteLength;
      if (!Number.isSafeInteger(total) || total > limits.maxTotalBytes) throw new ZipError("zip.limit.exceeded", "ZIP total input size exceeds the configured limit.", path);
      const modifiedAt = input.modifiedAt === void 0 ? new Date(timestamp.getTime()) : cloneDate(input.modifiedAt, "modifiedAt");
      pending.push({ path, data: input.data, byteLength, compression: entryCompression, modifiedAt });
    }
    return pending.map((entry) => {
      return {
        path: entry.path,
        data: snapshotEntryBytes(entry.data, entry.byteLength),
        compression: entry.compression,
        modifiedAt: entry.modifiedAt
      };
    });
  }
  async function serializeZipEntry(entry, localHeaderOffset, maxOutputBytes, signal) {
    const nameBytes = textEncoder.encode(entry.path);
    const method = entry.compression === "store" ? 0 : 8;
    const compressed = entry.compression === "store" ? entry.data : await deflateRawBytes(entry.data, maxOutputBytes, signal);
    const crc = crc32(entry.data);
    const dosTime = toDosTime(entry.modifiedAt);
    const dosDate = toDosDate(entry.modifiedAt);
    return {
      localHeader: buildLocalFileHeader(entry, nameBytes, method, compressed.length, crc, dosTime, dosDate),
      centralHeader: buildCentralDirectoryHeader(
        entry,
        nameBytes,
        method,
        compressed.length,
        crc,
        dosTime,
        dosDate,
        localHeaderOffset
      ),
      compressed
    };
  }
  function buildLocalFileHeader(entry, nameBytes, method, compressedSize, crc, dosTime, dosDate) {
    const localHeader = new Uint8Array(30 + nameBytes.length);
    writeUint32(localHeader, 0, LOCAL_FILE_SIGNATURE2);
    writeUint16(localHeader, 4, 20);
    writeUint16(localHeader, 6, ZIP_GENERAL_PURPOSE_FLAG_UTF82);
    writeUint16(localHeader, 8, method);
    writeUint16(localHeader, 10, dosTime);
    writeUint16(localHeader, 12, dosDate);
    writeUint32(localHeader, 14, crc);
    writeUint32(localHeader, 18, compressedSize);
    writeUint32(localHeader, 22, entry.data.length);
    writeUint16(localHeader, 26, nameBytes.length);
    writeUint16(localHeader, 28, 0);
    localHeader.set(nameBytes, 30);
    return localHeader;
  }
  function buildCentralDirectoryHeader(entry, nameBytes, method, compressedSize, crc, dosTime, dosDate, localHeaderOffset) {
    const centralHeader = new Uint8Array(46 + nameBytes.length);
    writeUint32(centralHeader, 0, CENTRAL_DIRECTORY_SIGNATURE2);
    writeUint16(centralHeader, 4, 20);
    writeUint16(centralHeader, 6, 20);
    writeUint16(centralHeader, 8, ZIP_GENERAL_PURPOSE_FLAG_UTF82);
    writeUint16(centralHeader, 10, method);
    writeUint16(centralHeader, 12, dosTime);
    writeUint16(centralHeader, 14, dosDate);
    writeUint32(centralHeader, 16, crc);
    writeUint32(centralHeader, 20, compressedSize);
    writeUint32(centralHeader, 24, entry.data.length);
    writeUint16(centralHeader, 28, nameBytes.length);
    writeUint16(centralHeader, 30, 0);
    writeUint16(centralHeader, 32, 0);
    writeUint16(centralHeader, 34, 0);
    writeUint16(centralHeader, 36, 0);
    writeUint32(centralHeader, 38, 0);
    writeUint32(centralHeader, 42, localHeaderOffset);
    centralHeader.set(nameBytes, 46);
    return centralHeader;
  }
  function buildEndOfCentralDirectory(entryCount, centralDirectorySize, centralDirectoryOffset) {
    const end = new Uint8Array(22);
    writeUint32(end, 0, EOCD_SIGNATURE2);
    writeUint16(end, 4, 0);
    writeUint16(end, 6, 0);
    writeUint16(end, 8, entryCount);
    writeUint16(end, 10, entryCount);
    writeUint32(end, 12, centralDirectorySize);
    writeUint32(end, 16, centralDirectoryOffset);
    writeUint16(end, 20, 0);
    return end;
  }
  function buildZipEntry(central, entryData) {
    return {
      path: central.path,
      data: new Uint8Array(entryData),
      compression: central.method === 0 ? "store" : "deflate",
      compressedSize: central.compressedSize,
      uncompressedSize: central.uncompressedSize,
      crc32: central.crc,
      modifiedAt: central.modifiedAt
    };
  }
  function toDosTime(date) {
    return date.getUTCHours() << 11 | date.getUTCMinutes() << 5 | Math.floor(date.getUTCSeconds() / 2);
  }
  function toDosDate(date) {
    const year = Math.max(1980, date.getUTCFullYear());
    return year - 1980 << 9 | date.getUTCMonth() + 1 << 5 | date.getUTCDate();
  }
  function throwIfAborted2(signal) {
    if (signal == null ? void 0 : signal.aborted) throw abortError();
  }
  function abortError() {
    return new DOMException("The operation was aborted.", "AbortError");
  }
  function isAbortError(error) {
    return error instanceof Error && error.name === "AbortError";
  }
  function zipFailure(code, message, path) {
    return { entries: [], diagnostics: [createDiagnostic("error", code, message, path)] };
  }
  async function readOfficePackage(data, options = {}) {
    const zip = await readZipPackage(data, options);
    return buildOfficePackageFromZipReadResult(zip.entries, zip.diagnostics);
  }
  var readOfficePackageAsync = readOfficePackage;
  function buildOfficePackageFromZipReadResult(entries, zipDiagnostics) {
    const diagnostics = [...zipDiagnostics];
    if (diagnostics.some((diagnostic) => diagnostic.severity === "error" && diagnostic.code.startsWith("zip."))) {
      return { entries: [], diagnostics };
    }
    const contentTypesXml = getZipTextEntry(entries, "[Content_Types].xml");
    let contentTypes;
    if (contentTypesXml === void 0) {
      diagnostics.push(
        createDiagnostic(
          "warning",
          "opc.content_types.missing",
          "The package does not contain [Content_Types].xml.",
          "[Content_Types].xml"
        )
      );
    } else {
      contentTypes = parseOpcContentTypesXml(contentTypesXml);
    }
    return contentTypes === void 0 ? { entries, diagnostics } : { entries, contentTypes, diagnostics };
  }
  function listOfficeMediaParts(entries) {
    return entries.filter((entry) => normalizeOpcPartPath(entry.path).includes("/media/"));
  }
  function readOfficePartRelationships(entries, sourcePartPath, options = {}) {
    const relsXml = getZipTextEntry(entries, buildOpcRelationshipsPath(sourcePartPath));
    if (relsXml === void 0) {
      return [];
    }
    const relationships = parseOpcRelationshipsXml(relsXml);
    return options.resolveTargets === false ? relationships : resolveOpcRelationships(relationships, sourcePartPath);
  }
  return __toCommonJS(stdin_exports);
})();

(() => {
  (globalThis).__mikuprojectMsOfficeCore = __mikuMsOfficeCoreRelease;
})();
