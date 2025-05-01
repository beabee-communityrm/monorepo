import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UploadClient } from "../../src/api/upload.client";
import { Fetch } from "../../src/utils/fetch";
import { ClientApiError } from "../../src/utils/error";
import {
  isSupportedImageType,
  isSupportedDocumentType
} from "@beabee/beabee-common";
import type { BaseClientOptions, ClientApiErrorData } from "../../src/types";

// Mock the Fetch class and its post method
const mockFetchPost = vi.fn();
vi.mock("../../src/utils/fetch", () => {
  // Create a mock constructor that returns an object with the mocked post method
  const MockFetch = vi.fn().mockImplementation(() => ({
    post: mockFetchPost
    // Mock other Fetch methods if needed by UploadClient or its children
  }));
  return { Fetch: MockFetch }; // Export the mock constructor as Fetch
});

// Mock the type guards
vi.mock("@beabee/beabee-common", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@beabee/beabee-common")>();
  return {
    ...actual,
    isSupportedImageType: vi.fn(),
    isSupportedDocumentType: vi.fn()
  };
});

// mockFetchPost is already the mock function we need
const mockIsSupportedImageType = vi.mocked(isSupportedImageType);
const mockIsSupportedDocumentType = vi.mocked(isSupportedDocumentType);

// Helper to create a mock File object
const createMockFile = (name: string, type: string, size: number): File => {
  const blob = new Blob(["a".repeat(size)], { type });
  return new File([blob], name, { type });
};

describe("UploadClient", () => {
  let uploadClient: UploadClient;
  const baseOptions: BaseClientOptions = { host: "test-audience" };

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks(); // Resets the mock constructor call count too
    mockFetchPost.mockClear(); // Clear calls specifically for the post method
    // Instantiate client (MockFetch constructor is called here)
    uploadClient = new UploadClient(baseOptions);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should upload an image file using the image client", async () => {
    const imageFile = createMockFile("test.png", "image/png", 1024);
    const mockResponse = {
      data: {
        id: "img123",
        url: "test-audience/api/1.0/images/img123",
        path: "images/img123",
        hash: "hash123"
      }
    };

    mockIsSupportedImageType.mockReturnValue(true);
    mockIsSupportedDocumentType.mockReturnValue(false);
    mockFetchPost.mockResolvedValue(mockResponse);

    const result = await uploadClient.uploadFile(imageFile);

    expect(mockIsSupportedImageType).toHaveBeenCalledWith("image/png");
    expect(mockIsSupportedDocumentType).not.toHaveBeenCalled();
    expect(mockFetchPost).toHaveBeenCalledOnce();
    expect(mockFetchPost).toHaveBeenCalledWith(
      expect.stringContaining("/images"),
      expect.any(FormData),
      { dataType: "multipart" }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("should upload a document file using the document client", async () => {
    const documentFile = createMockFile("test.pdf", "application/pdf", 2048);
    const mockResponse = {
      data: {
        id: "doc456",
        url: "test-audience/api/1.0/documents/doc456",
        path: "documents/doc456",
        hash: "hash456",
        filename: "test.pdf"
      }
    };

    mockIsSupportedImageType.mockReturnValue(false);
    mockIsSupportedDocumentType.mockReturnValue(true);
    mockFetchPost.mockResolvedValue(mockResponse);

    const result = await uploadClient.uploadFile(documentFile);

    expect(mockIsSupportedImageType).toHaveBeenCalledWith("application/pdf");
    expect(mockIsSupportedDocumentType).toHaveBeenCalledWith("application/pdf");
    expect(mockFetchPost).toHaveBeenCalledOnce();
    expect(mockFetchPost).toHaveBeenCalledWith(
      expect.stringContaining("/documents"),
      expect.any(FormData),
      { dataType: "multipart" }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("should throw ClientApiError for unsupported file types", async () => {
    const unsupportedFile = createMockFile("test.txt", "text/plain", 512);

    mockIsSupportedImageType.mockReturnValue(false);
    mockIsSupportedDocumentType.mockReturnValue(false);

    await expect(uploadClient.uploadFile(unsupportedFile)).rejects.toThrow(
      ClientApiError
    );
    await expect(
      uploadClient.uploadFile(unsupportedFile)
    ).rejects.toHaveProperty("code", "UNSUPPORTED_FILE_TYPE");

    expect(mockIsSupportedImageType).toHaveBeenCalledWith("text/plain");
    expect(mockIsSupportedDocumentType).toHaveBeenCalledWith("text/plain");
    expect(mockFetchPost).not.toHaveBeenCalled();
  });

  it("should handle rate limit error (429) during image upload", async () => {
    const imageFile = createMockFile("test.jpg", "image/jpeg", 1024);
    const errorData: ClientApiErrorData = {
      httpCode: 429,
      code: "RATE_LIMIT_EXCEEDED"
    };
    const rateLimitError = new ClientApiError("Rate limit exceeded", errorData);

    mockIsSupportedImageType.mockReturnValue(true);
    mockIsSupportedDocumentType.mockReturnValue(false);
    mockFetchPost.mockRejectedValue(rateLimitError);

    await expect(uploadClient.uploadFile(imageFile)).rejects.toThrow(
      ClientApiError
    );
    await expect(uploadClient.uploadFile(imageFile)).rejects.toHaveProperty(
      "httpCode",
      429
    );
    await expect(uploadClient.uploadFile(imageFile)).rejects.toHaveProperty(
      "code",
      "RATE_LIMIT_EXCEEDED"
    );

    expect(mockFetchPost).toHaveBeenCalledOnce();
    expect(mockFetchPost).toHaveBeenCalledWith(
      expect.stringContaining("/images"),
      expect.any(FormData),
      { dataType: "multipart" }
    );
  });

  it("should handle rate limit error (429) during document upload", async () => {
    const documentFile = createMockFile("doc.pdf", "application/pdf", 2048);
    const errorData: ClientApiErrorData = {
      httpCode: 429,
      code: "RATE_LIMIT_EXCEEDED"
    };
    const rateLimitError = new ClientApiError("Rate limit exceeded", errorData);

    mockIsSupportedImageType.mockReturnValue(false);
    mockIsSupportedDocumentType.mockReturnValue(true);
    mockFetchPost.mockRejectedValue(rateLimitError);

    await expect(uploadClient.uploadFile(documentFile)).rejects.toThrow(
      ClientApiError
    );
    await expect(uploadClient.uploadFile(documentFile)).rejects.toHaveProperty(
      "httpCode",
      429
    );
    await expect(uploadClient.uploadFile(documentFile)).rejects.toHaveProperty(
      "code",
      "RATE_LIMIT_EXCEEDED"
    );

    expect(mockFetchPost).toHaveBeenCalledOnce();
    expect(mockFetchPost).toHaveBeenCalledWith(
      expect.stringContaining("/documents"),
      expect.any(FormData),
      { dataType: "multipart" }
    );
  });
});
