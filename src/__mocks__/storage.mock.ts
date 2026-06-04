/** Shared mock StorageService — no real R2 calls in tests. */
export const mockStorageService = {
  uploadFile: jest.fn(),
  uploadMedia: jest.fn(),
  deleteFile: jest.fn(),
};
