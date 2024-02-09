import * as Menubar from "@radix-ui/react-menubar";
import { Icon } from "@iconify/react";
import { JSONContent } from "@tiptap/core";
import { Level } from "@tiptap/extension-heading";
import {
    EditorContent,
    EditorContext,
    useCurrentEditor,
    useEditor,
} from "@tiptap/react";
import clsx from "clsx";
import Link from "next/link";
import { ComponentProps, forwardRef } from "react";

import { Button } from "@/app/components/Button";
import { tiptapExtensions } from "@/app/lib/tiptapExtensions";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { useCampaignSession } from "@/app/providers/CampaignSessionProvider";

interface MenuItemProps {
    icon: string;
    nodeType?: string;
    nodeTypeAttributes?: Record<string, any>;
    disabled?: boolean;
    onClick: () => void;
}

const MenuRootItem = ({
    icon,
    nodeType,
    nodeTypeAttributes,
    disabled,
    onClick,
}: MenuItemProps) => {
    const { editor } = useCurrentEditor();

    return (
        <button
            className={clsx(
                "rounded p-1 hover:bg-white/5",
                !disabled &&
                    nodeType && {
                        "bg-white/10 text-white/80": editor?.isActive(
                            nodeType,
                            nodeTypeAttributes,
                        ),
                    },
                {
                    "cursor-not-allowed text-white/40": disabled,
                },
            )}
            onClick={onClick}
        >
            <Icon icon={icon} className="h-5 w-5" />
        </button>
    );
};

const MenuItem = ({
    icon,
    label,
    nodeType,
    nodeTypeAttributes,
    disabled,
    onClick,
}: MenuItemProps & { label: string }) => {
    const { editor } = useCurrentEditor();

    return (
        <Menubar.Item
            className={clsx(
                "rounded p-1 hover:bg-white/5",
                !disabled &&
                    nodeType && {
                        "bg-white/10 text-white/80": editor?.isActive(
                            nodeType,
                            nodeTypeAttributes,
                        ),
                    },
                {
                    "cursor-not-allowed text-white/40": disabled,
                },
            )}
            onClick={onClick}
        >
            <Icon icon={icon} className="h-5 w-5" />

            <span className="sr-only">{label}</span>
        </Menubar.Item>
    );
};

const TextEditorMenuBar = () => {
    const campaign = useCampaign();
    const session = useCampaignSession();
    const { editor } = useCurrentEditor();

    return (
        <Menubar.Root className="flex gap-2 rounded-lg bg-white/5 p-1">
            <MenuRootItem
                icon="mdi:format-paragraph"
                nodeType="paragraph"
                onClick={() => editor?.chain().focus().setParagraph().run()}
            />

            <Menubar.Menu>
                <Menubar.Trigger
                    className={clsx(
                        "m-0 flex items-center gap-1 rounded p-1 leading-none hover:bg-white/5",
                        {
                            "bg-white/10": editor?.isActive("heading"),
                        },
                    )}
                >
                    Headings
                    <Icon icon="mdi:chevron-down" className="h-5 w-5" />
                </Menubar.Trigger>
                <Menubar.Portal>
                    <Menubar.Content className="flex gap-1 rounded-lg border border-white/5 bg-gray-700 p-1 shadow-lg">
                        {[1, 2, 3, 4, 5, 6].map((level) => (
                            <MenuItem
                                key={level}
                                icon={`mdi:format-header-${level}`}
                                label={`Heading ${level}`}
                                nodeType="heading"
                                nodeTypeAttributes={{ level }}
                                onClick={() =>
                                    editor
                                        ?.chain()
                                        .focus()
                                        .setHeading({ level: level as Level })
                                        .run()
                                }
                            />
                        ))}
                    </Menubar.Content>
                </Menubar.Portal>
            </Menubar.Menu>

            <MenuRootItem
                icon="mdi:format-bold"
                nodeType="bold"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                disabled={!editor?.can().chain().focus().toggleBold().run()}
            />
            <MenuRootItem
                icon="mdi:format-italic"
                nodeType="italic"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                disabled={!editor?.can().chain().focus().toggleItalic().run()}
            />
            <MenuRootItem
                icon="mdi:format-underline"
                nodeType="underline"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                disabled={
                    !editor?.can().chain().focus().toggleUnderline().run()
                }
            />
            <MenuRootItem
                icon="mdi:format-list-bulleted"
                nodeType="bulletList"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                disabled={
                    !editor?.can().chain().focus().toggleBulletList().run()
                }
            />
            <MenuRootItem
                icon="mdi:format-list-numbered"
                nodeType="orderedList"
                onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                }
                disabled={
                    !editor?.can().chain().focus().toggleOrderedList().run()
                }
            />
            <MenuRootItem
                icon="mdi:format-quote-close"
                nodeType="blockquote"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                disabled={
                    !editor?.can().chain().focus().toggleBlockquote().run()
                }
            />
            <MenuRootItem
                icon="mdi:undo"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().chain().focus().undo().run()}
            />
            <MenuRootItem
                icon="mdi:redo"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().chain().focus().redo().run()}
            />

            <div className="flex-1" />

            <Button
                size="sm"
                color="primary"
                onClick={async () => {
                    if (!editor) return;

                    editor.setEditable(false);

                    await session.updateSummary({
                        campaignId: campaign.id,
                        sessionId: session.id,
                        richText: editor.getJSON(),
                    });

                    editor.setEditable(true);
                }}
            >
                Save
            </Button>
        </Menubar.Root>
    );
};

export const RichTextEditor = forwardRef<
    HTMLDivElement,
    Omit<ComponentProps<"div">, "children" | "ref" | "content"> & {
        content: JSONContent;
    }
>(({ content, className, ...props }, ref) => {
    const editor = useEditor({
        extensions: tiptapExtensions,
        content,
        editorProps: {
            attributes: {
                class: "max-w-none focus:outline-none h-full",
            },
        },
    });

    return (
        <div
            {...props}
            ref={ref}
            className={clsx(className, "flex flex-col gap-3 p-3")}
        >
            <EditorContext.Provider
                value={{
                    editor,
                }}
            >
                <p className="flex items-center gap-1 text-yellow-500">
                    <Icon icon="mdi:alert" className="h-5 w-5" />
                    This editor is experimental please report any issues you
                    find on the
                    <Link href="https://discord.gg/DsSeGSc5na">Discord</Link>
                </p>
                <TextEditorMenuBar />
                <EditorContent
                    editor={editor}
                    className="prose prose-sm prose-sky prose-invert h-full max-w-none flex-1 focus:outline-none"
                />
            </EditorContext.Provider>
        </div>
    );
});
