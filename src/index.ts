import { defineExtension, shallowRef, useActiveTextEditor, useCommand, useDocumentText, useEditorDecorations, useTextEditorSelections, watchEffect } from "reactive-vscode";
import * as ts from "typescript";
import { type DecorationOptions, DecorationRangeBehavior, type DecorationRenderOptions, Range, type TextDocument } from "vscode";
import { config } from "./config";
import { commands } from "./generated/meta";

const supportedLanguages = [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact"
];

export const { activate, deactivate } = defineExtension(() => {
    const editor = useActiveTextEditor();
    const selections = useTextEditorSelections(editor);
    const documentText = useDocumentText(() => editor.value?.document);

    const quoteDecorations = useDecorations({
        textDecoration: "none; font-size: 0;",
        before: {
            contentText: `"`,
            color: "#07FF78",
            margin: [
                "auto 0;",
                "border-radius: 0.25em;"
            ].join(" ")
        }
    });

    const semiDecorations = useDecorations({
        after: {
            contentText: ";",
            color: "inherit",
            margin: [
                "auto 0;",
                "border-radius: 0.25em;"
            ].join(" ")
        }
    });

    watchEffect(() => {
        semiDecorations.value = [];
        quoteDecorations.value = [];

        if (!config.enabled) {
            return;
        }

        if (!editor.value || !documentText.value) {
            return;
        }

        const { document } = editor.value;
        if (!supportedLanguages.includes(document.languageId)) {
            return;
        }

        const ast = ts.createSourceFile("", documentText.value, ts.ScriptTarget.ESNext);

        ast.forEachChild(function cb(node) {
            const text = node.getText(ast);

            if (
                ts.isExportAssignment(node)
                || ts.isExportDeclaration(node)
                || ts.isImportDeclaration(node)
                || ts.isPropertyDeclaration(node)
                || ts.isTypeAliasDeclaration(node)
                || ts.isBreakOrContinueStatement(node)
                || ts.isDoStatement(node)
                || ts.isExpressionStatement(node)
                || ts.isReturnStatement(node)
                || ts.isVariableStatement(node)
            ) {
                const text = node.getText(ast);
                if (!text.endsWith(";")) {
                    const end = node.getEnd() - 1;
                    semiDecorations.value.push(
                        createDecorationItem(document, end)
                    );
                }
            }
            if (ts.isStringLiteral(node)) {
                const text = node.getText(ast);
                if (text.startsWith("'") && text.endsWith("'")) {
                    const start = node.getStart(ast);
                    const end = node.getEnd() - 1;
                    quoteDecorations.value.push(
                        createDecorationItem(document, start),
                        createDecorationItem(document, end)
                    );
                }
            }
            node.forEachChild(cb);
        });
    });

    useCommand(commands.toggle, () => {
        config.$update("enabled", !config.enabled);
    });

    function useDecorations(options: DecorationRenderOptions) {
        const decorations = shallowRef<DecorationOptions[]>([]);
        useEditorDecorations(editor, {
            rangeBehavior: DecorationRangeBehavior.ClosedClosed,
            ...options
        }, () => decorations.value.filter(
            (item) => !selections.value.every(({ start, end }) => item.range.start.line >= start.line && item.range.end.line <= end.line)
        ));
        return decorations;
    }
});

function createDecorationItem(document: TextDocument, offset: number): DecorationOptions {
    return {
        range: new Range(
            document.positionAt(offset),
            document.positionAt(offset + 1)
        )
    };
}