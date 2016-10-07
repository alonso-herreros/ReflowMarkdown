'use strict';
import * as vscode from 'vscode';

/* TODOS
* clean up
    * remove (most) traces of generated tutorial
    * worst crap-programming

* write brief first documentation
* readme.md

* configurable:
    * wrapAt 
    * insert linebreaks as-you-type

*/

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.reflowParagraph', () => {

        var editor = vscode.window.activeTextEditor;
        if(!editor) {
            return; // No open text editor
        }

        // TODO should be configurable
        var wrapAt = 80;

        const selection = editor.selection;
        const position = editor.selection.active;

        var lineNo = position.line;
        //console.log(`lineNo: ${lineNo}`);

        var paragraphStartLineNo = position.line;
        while(paragraphStartLineNo - 1 > 0 && !editor.document.lineAt(paragraphStartLineNo - 1).isEmptyOrWhitespace)
        {
            paragraphStartLineNo-=1;
        }
        // paragraphStartLineNo now points to the first line of the paragraph or the first line in the document.
        //console.log(`par-start: ${paragraphStartLineNo}.`);

        var maxLineNo = editor.document.lineCount;

        var paragraphEndLineNo = position.line;
        while(paragraphEndLineNo + 1< maxLineNo && !editor.document.lineAt(paragraphEndLineNo + 1).isEmptyOrWhitespace)
        {
            paragraphEndLineNo+=1;
        }
        // paragraphEndLineNo now points to the last line or the last line of the paragraph.
        //console.log(`par-end: ${paragraphEndLineNo}`);

        // TODO a bit clumsy, and doesn't include final line-separator... 
        var len = editor.document.lineAt(paragraphEndLineNo).text.length;
        var range = new vscode.Range(paragraphStartLineNo, 0, paragraphEndLineNo, len);
        var text = editor.document.getText(range);

        var words = text.split(/\s/);

        var newLines : string[] = [];
        var curLine = "";

        words.forEach(word => {
            if(word != "")
            {
                if(curLine.length + 1 + word.length > wrapAt){
                    newLines.push(curLine);
                    curLine = "";
                }
                
                if(curLine.length > 0)
                    curLine = curLine.concat(" ");
                
                curLine = curLine.concat(word);
            }
        });

        // the final line will be in curLine  
        if(curLine.length > 0)
        {
            newLines.push(curLine);
        }

        // newParagraph is constructed with \n for line-endings; 
        // textEditorEdit.replace will insert the correct environment-specific line-endings 
        var newParagraph = newLines.join("\n");
        // console.log(newParagraph);

        var applied = editor.edit(
            function (textEditorEdit) {
                textEditorEdit.replace(range, newParagraph)
            }
        );
        
        // reset selection (TODO may be contraintuitive... maybe rather reset to single position, always?)
        editor.selection = selection;        
    });

   context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}