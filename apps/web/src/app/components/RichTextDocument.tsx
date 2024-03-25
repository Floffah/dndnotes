import { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { ComponentProps } from "react";

export function RichTextDocument({
    content,
    ...props
}: Omit<
    ComponentProps<typeof EditorContent>,
    "children" | "ref" | "content" | "editor"
> & {
    content: JSONContent;
}) {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        editable: false,
    });

    return <EditorContent editor={editor} {...props} />;
}
