import { useEffect, useState, type FormEvent } from "react";
import {
  FileText,
  Upload,
  Loader2,
  RefreshCw,
  Database,
  Trash2,
  Settings,
} from "lucide-react";
import {
  uploadKnowledgeDocumentApi,
  uploadKnowledgeFilesApi,
  searchBusinessKnowledgeApi,
  getKnowledgeDocumentsApi,
  deleteKnowledgeDocumentApi,
  type KnowledgeSource,
  type KnowledgeDocument,
  type KnowledgeFilesUploadResponse,
} from "../../api/knowledgeApi";
import {
  showSuccessToast,
  showErrorToast,
  showDeleteConfirm,
} from "../../utils/swal";

const Knowledge = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [fileUploadResults, setFileUploadResults] = useState<
    KnowledgeFilesUploadResponse["results"]
  >([]);
  const [documentName, setDocumentName] = useState("");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [searching, setSearching] = useState(false);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  useEffect(() => {
    void loadKnowledgeDocuments();
  }, []);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);

    if (newFiles.length === 0) return;

    const combinedFiles = [...selectedFiles, ...newFiles];

    if (combinedFiles.length > 10) {
      showErrorToast("You can upload a maximum of 10 files at a time.");
      e.target.value = "";
      return;
    }

    const invalidFile = newFiles.find((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();

      return !["pdf", "docx", "doc", "txt"].includes(extension || "");
    });

    if (invalidFile) {
      showErrorToast(`${invalidFile.name}: Unsupported file format.`);
      e.target.value = "";
      return;
    }

    const oversizedFile = newFiles.find((file) => file.size > 10 * 1024 * 1024);

    if (oversizedFile) {
      showErrorToast(
        `${oversizedFile.name} exceeds the 10 MB file size limit.`,
      );
      e.target.value = "";
      return;
    }

    setSelectedFiles(combinedFiles);
    console.log("FILES SELECTED:", combinedFiles);
    setFileUploadResults([]);

    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((previousFiles) =>
      previousFiles.filter((_, i) => i !== index),
    );
  };

  const handleUploadFiles = async () => {
    console.log("FILES AT UPLOAD:", selectedFiles);
    if (selectedFiles.length === 0) {
      showErrorToast("Please select at least one file.");
      return;
    }

    try {
      setUploadingFiles(true);
      setFileUploadResults([]);

      const response = await uploadKnowledgeFilesApi(selectedFiles);

      setFileUploadResults(response.results);

      if (response.successfulFiles > 0) {
        showSuccessToast(
          `${response.successfulFiles} file(s) processed successfully.`,
        );
      }

      if (response.failedFiles > 0) {
        showErrorToast(
          `${response.failedFiles} file(s) could not be processed.`,
        );
      }

      if (response.successfulFiles > 0) {
        setSelectedFiles([]);
        await loadKnowledgeDocuments();
      }
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (
              error as {
                response?: { data?: { message?: string } };
              }
            ).response?.data?.message
          : undefined;

      showErrorToast(message || "Unable to upload files.");
    } finally {
      setUploadingFiles(false);
    }
  };


const handleDeleteDocument = async (documentName: string) => {
  const result = await showDeleteConfirm(
    "Delete Knowledge Document?",
    `Are you sure you want to delete "${documentName}" and all its associated chunks?`,
  );

  if (!result.isConfirmed) return;

  try {
    const response = await deleteKnowledgeDocumentApi(documentName);

    showSuccessToast(
      `${response.message}. ${response.deletedChunks} chunks deleted.`,
    );

    await loadKnowledgeDocuments();
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error !== null && "response" in error
        ? (
            error as {
              response?: { data?: { message?: string } };
            }
          ).response?.data?.message
        : undefined;

    showErrorToast(message || "Unable to delete knowledge document.");
  }
};


  const loadKnowledgeDocuments = async () => {
    try {
      setLoadingDocuments(true);

      const response = await getKnowledgeDocumentsApi();

      setDocuments(response.data);
    } catch {
      showErrorToast("Unable to load knowledge documents.");
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!question.trim()) {
      showErrorToast("Please enter your question.");
      return;
    }

    try {
      setSearching(true);
      setAnswer("");
      setSources([]);

      const response = await searchBusinessKnowledgeApi(question);

      setAnswer(response.data.answer);
      setSources(response.data.sources);
  } catch (error: unknown) {
  const apiError = error as {
    response?: {
      status?: number;
      data?: {
        message?: string;
      };
    };
  };

  const status = apiError.response?.status;
  const message = apiError.response?.data?.message;

  if (status === 429) {
    showErrorToast(
      message ||
        "The AI service has temporarily reached its daily usage limit. Please try again later."
    );
  } else {
    showErrorToast(
      message || "Unable to search business knowledge."
    );
  }
} finally {
      setSearching(false);
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!documentName.trim() || !content.trim()) {
      showErrorToast("Please enter document name and content.");
      return;
    }

    try {
      setUploading(true);

      const response = await uploadKnowledgeDocumentApi(documentName, content);

      showSuccessToast(
        `Document processed successfully. ${response.totalChunks} chunks created.`,
      );

      setDocumentName("");
      setContent("");
      await loadKnowledgeDocuments();
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (
              error as {
                response?: { data?: { message?: string } };
              }
            ).response?.data?.message
          : undefined;

      showErrorToast(message || "Unable to upload document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          RAG Knowledge Base
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload business documents and build your AI knowledge base.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Upload Knowledge Document
            </h2>
            <p className="text-sm text-slate-500">
              Add business information to your knowledge base.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Document Name
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              maxLength={255}
              placeholder="Example: Product Warranty Policy"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Document Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={100000}
              rows={12}
              placeholder="Enter or paste your business document content here..."
              className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              required
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {content.length.toLocaleString("en-IN")} / 100,000 characters
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing Document...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>

        {/* Multiple File Upload Section */}
        <div className="mt-6 border-t border-slate-200 pt-6">
          <h3 className="mb-2 text-base font-semibold text-slate-800">
            Or Upload Documents
          </h3>

          <p className="mb-4 text-sm text-slate-500">
            Select multiple PDF, DOCX, DOC or TXT files to add them to your AI
            knowledge base.
          </p>

          <input
            type="file"
            id="knowledgeFiles"
            multiple
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileSelection}
            disabled={uploadingFiles}
            className="hidden"
          />

          <label
            htmlFor="knowledgeFiles"
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-8 text-center transition hover:border-blue-500 hover:bg-blue-100"
          >
            <Upload size={32} className="mb-3 text-blue-600" />

            <span className="text-sm font-semibold text-blue-700">
              Click to select documents
            </span>

            <span className="mt-1 text-xs text-slate-500">
              PDF, DOCX, DOC and TXT · Maximum 10 files · 10 MB each
            </span>
          </label>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700">
                  Selected Files ({selectedFiles.length})
                </h4>

                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  disabled={uploadingFiles}
                  className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>

              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText size={20} className="shrink-0 text-blue-500" />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {file.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    disabled={uploadingFiles}
                    className="ml-3 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => void handleUploadFiles()}
                  disabled={uploadingFiles}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadingFiles ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing Files...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload {selectedFiles.length} File(s)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Individual File Processing Results */}
          {fileUploadResults.length > 0 && (
            <div className="mt-5 space-y-2">
              <h4 className="text-sm font-semibold text-slate-700">
                Upload Results
              </h4>

              {fileUploadResults.map((result, index) => (
                <div
                  key={`${result.fileName}-${index}`}
                  className={`rounded-lg border p-3 ${
                    result.success
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="break-all text-sm font-medium text-slate-700">
                      {result.fileName}
                    </p>

                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        result.success ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {result.success ? "Success" : "Failed"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-600">
                    {result.message}
                    {result.totalChunks !== undefined &&
                      ` · ${result.totalChunks} chunks created`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* RAG Question and Answer Section */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Ask Your Business Knowledge
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Ask questions based on your uploaded business documents.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Example: What is our product warranty policy?"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            required
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={searching}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searching ? (
                <>
                  <Settings size={18} className="animate-spin" />
                  AI Thinking...
                </>
              ) : (
                <>
                  <Settings size={18} />
                  Ask AI
                </>
              )}
            </button>
          </div>
        </form>

        {answer && (
          <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-5">
            <h3 className="mb-3 font-semibold text-slate-800">AI Answer</h3>

            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {answer}
            </p>

            {sources.length > 0 && (
              <div className="mt-5 border-t border-blue-200 pt-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-800">
                  Sources
                </h4>

                <div className="space-y-2">
                  {sources.map((source, index) => (
                    <div
                      key={`${source.documentName}-${source.chunkIndex}-${index}`}
                      className="rounded-md bg-white p-3 text-sm"
                    >
                      <p className="font-medium text-slate-700">
                        {source.documentName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Chunk: {source.chunkIndex} | Similarity:{" "}
                        {(source.similarity * 100).toFixed(2)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Knowledge Documents Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Database size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Knowledge Documents
              </h2>
              <p className="text-sm text-slate-500">
                Manage your uploaded business knowledge.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadKnowledgeDocuments()}
            disabled={loadingDocuments}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loadingDocuments ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loadingDocuments ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Loading knowledge documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No knowledge documents uploaded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Document Name</th>
                  <th className="px-4 py-3 font-semibold">Chunks</th>
                  <th className="px-4 py-3 font-semibold">Uploaded Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {documents.map((document) => (
                  <tr
                    key={document.document_name}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <FileText size={17} className="text-blue-500" />
                        {document.document_name}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {document.total_chunks}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {new Date(document.uploaded_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          void handleDeleteDocument(document.document_name)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Knowledge;
