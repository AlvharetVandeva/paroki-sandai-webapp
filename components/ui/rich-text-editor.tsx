"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Quote,
  Link as LinkIcon,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

import { useRef, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!editor) {
    return null;
  }

  const btnClass = (isActive: boolean) =>
    `p-2 rounded cursor-pointer ${
      isActive
        ? "bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white"
        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
    }`;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah gambar");
      }

      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat mengunggah gambar");
    } finally {
      setIsUploading(false);
      // Reset input value so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b dark:border-gray-600">
      <div className="flex flex-wrap items-center divide-gray-200 sm:divide-x sm:rtl:divide-x-reverse dark:divide-gray-600">
        <div className="flex items-center space-x-1 rtl:space-x-reverse sm:pe-4">
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))} title="Bold">
            <Bold className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))} title="Italic">
            <Italic className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive("underline"))} title="Underline">
            <UnderlineIcon className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive("strike"))} title="Strikethrough">
            <Strikethrough className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-1 rtl:space-x-reverse sm:ps-4 sm:pe-4">
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))} title="Heading 2">
            <Heading2 className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive("heading", { level: 3 }))} title="Heading 3">
            <Heading3 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-1 rtl:space-x-reverse sm:ps-4 sm:pe-4">
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="Align Left">
            <AlignLeft className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="Align Center">
            <AlignCenter className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))} title="Align Right">
            <AlignRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-1 rtl:space-x-reverse sm:ps-4">
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))} title="Bullet List">
            <List className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))} title="Ordered List">
            <ListOrdered className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive("blockquote"))} title="Blockquote">
            <Quote className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive("codeBlock"))} title="Code">
            <Code className="w-5 h-5" />
          </button>
          <button type="button" onClick={setLink} className={btnClass(editor.isActive("link"))} title="Add Link">
            <LinkIcon className="w-5 h-5" />
          </button>
          
          {/* Image Upload Button */}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className={btnClass(false)} 
            title="Upload Image"
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <ImageIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full my-4 h-auto',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400 min-h-[150px] max-h-[400px] resize-y overflow-y-auto prose prose-sm max-w-none dark:prose-invert focus:outline-none",
      },
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        const hasImage = items.some((item) => item.type.startsWith("image"));

        if (hasImage) {
          event.preventDefault();
          for (const item of items) {
            if (item.type.startsWith("image")) {
              const file = item.getAsFile();
              if (file) {
                const uploadImage = async () => {
                  try {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      const { schema } = view.state;
                      const node = schema.nodes.image.create({ src: data.url });
                      const transaction = view.state.tr.replaceSelectionWith(node);
                      view.dispatch(transaction);
                    } else {
                      alert(data.error || "Gagal mengunggah gambar saat paste");
                    }
                  } catch (e) {
                    console.error("Paste upload failed", e);
                  }
                };
                uploadImage();
              }
            }
          }
          return true;
        }
        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const files = Array.from(event.dataTransfer.files);
          const hasImage = files.some((file) => file.type.startsWith("image"));

          if (hasImage) {
            event.preventDefault();
            for (const file of files) {
              if (file.type.startsWith("image")) {
                const uploadImage = async () => {
                  try {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      const { schema } = view.state;
                      const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                      const node = schema.nodes.image.create({ src: data.url });

                      if (coordinates) {
                        const transaction = view.state.tr.insert(coordinates.pos, node);
                        view.dispatch(transaction);
                      }
                    } else {
                      alert(data.error || "Gagal mengunggah gambar saat drop");
                    }
                  } catch (e) {
                    console.error("Drop upload failed", e);
                  }
                };
                uploadImage();
              }
            }
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
      <MenuBar editor={editor} />
      <div className="px-4 py-2 bg-white rounded-b-lg dark:bg-gray-800">
        <EditorContent editor={editor} className="w-full h-full" />
      </div>
    </div>
  );
}
