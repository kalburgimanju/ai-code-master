import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

interface Props {
  planId: string;
  lessonId: string;
  lessonTitle: string;
  onUploaded: () => void;
}

type SourceMode = "file" | "record";

export function VideoUploader({ planId, lessonId, lessonTitle, onUploaded }: Props) {
  const [mode, setMode] = useState<SourceMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(lessonTitle);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState("private");

  const [hasScript, setHasScript] = useState(false);
  const [generatingMeta, setGeneratingMeta] = useState(false);
  const [metaError, setMetaError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Recording state
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Load lesson to detect if a script exists (for metadata generation)
  useEffect(() => {
    api
      .getLesson(planId, lessonId)
      .then((l) => setHasScript(!!l.full_script))
      .catch(() => setHasScript(false));
  }, [planId, lessonId]);

  const handleGenerateMeta = async () => {
    setGeneratingMeta(true);
    setMetaError("");
    try {
      const res = await api.generateMetadata(planId, lessonId);
      setTitle(res.title);
      setDescription(res.description);
    } catch (err: unknown) {
      setMetaError(err instanceof Error ? err.message : "Failed to generate metadata");
    } finally {
      setGeneratingMeta(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
      };
      recorder.start();
      setRecording(true);
      setRecordedBlob(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not access camera/microphone");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const getUploadFile = (): File | null => {
    if (mode === "file") return file;
    if (recordedBlob) {
      const ext = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
      return new File([recordedBlob], `${lessonTitle || "recording"}.${ext}`, { type: recordedBlob.type });
    }
    return null;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const uploadFile = getUploadFile();
    if (!uploadFile) return;
    setUploading(true);
    setError("");
    try {
      await api.uploadVideo(lessonId, title, description, tags, uploadFile);
      onUploaded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const canUpload = mode === "file" ? !!file : !!recordedBlob;

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      {/* Source toggle */}
      <div>
        <label className="text-sm font-medium mb-2 block">Video Source</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`flex-1 h-10 rounded-md text-sm font-medium border transition-colors ${
              mode === "file"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-input text-muted-foreground hover:bg-muted"
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode("record")}
            className={`flex-1 h-10 rounded-md text-sm font-medium border transition-colors ${
              mode === "record"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-input text-muted-foreground hover:bg-muted"
            }`}
          >
            Record Video
          </button>
        </div>
      </div>

      {/* File picker */}
      {mode === "file" && (
        <div>
          <label className="text-sm font-medium mb-2 block">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
          />
        </div>
      )}

      {/* Recorder */}
      {mode === "record" && (
        <div className="p-4 rounded-lg border border-border bg-background">
          {!recording && !recordedBlob && (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90"
            >
              ● Start Recording
            </button>
          )}
          {recording && (
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm text-muted-foreground">Recording...</span>
              <button
                type="button"
                onClick={stopRecording}
                className="ml-auto h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
              >
                Stop &amp; Save
              </button>
            </div>
          )}
          {recordedBlob && !recording && (
            <div className="space-y-2">
              <video src={URL.createObjectURL(recordedBlob)} controls className="w-full rounded-md" />
              <button
                type="button"
                onClick={startRecording}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Re-record
              </button>
            </div>
          )}
        </div>
      )}

      {/* Generate metadata button */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/60">
        <button
          type="button"
          onClick={handleGenerateMeta}
          disabled={generatingMeta || !hasScript}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-accent/20 text-accent text-xs font-medium hover:bg-accent/30 disabled:opacity-50"
        >
          {generatingMeta ? "Generating..." : "Generate Title & Description from Script"}
        </button>
        {!hasScript && (
          <span className="text-xs text-muted-foreground">
            Generate a script first to enable this.
          </span>
        )}
      </div>
      {metaError && <p className="text-sm text-destructive">{metaError}</p>}

      {/* Title */}
      <div>
        <label className="text-sm font-medium mb-2 block">YouTube Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {/* Tags + privacy */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="python, tutorial, beginner"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Privacy</label>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={uploading || !canUpload}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload to YouTube"}
      </button>
    </form>
  );
}
