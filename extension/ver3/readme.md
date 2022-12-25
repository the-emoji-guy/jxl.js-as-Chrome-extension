# Message passing between script and iFrame
Requires the most changes to the source file as it now uses message passing between the initial content script and a hidden iFrame. Also not the fastest since it needs to wait for the body to load before it can insert an iFrame.
