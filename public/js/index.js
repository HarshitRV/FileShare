"use strict";
console.log("index.js loaded...");

const url = window.location.href;

if(url.includes('/upload')){
    const copyToClipboard = document.getElementById('clipboard');
    const shareLink = document.getElementById('share-link');
    const shareBtn = document.getElementById('share-btn');

    console.log(shareLink.textContent);
    const shareData = {
        title: 'Share',
        text: 'Share the generated link',
        url: shareLink.textContent
    }

    shareBtn.addEventListener('click', async (e)=> {
        e.preventDefault();
        try {
            await navigator.share(shareData);
        } catch (e) {
            console.log(e);
        }
    });

    copyToClipboard.addEventListener('click', async ()=> {
       await navigator.clipboard.writeText(shareLink.textContent);
       alert('Copied to clipboard');
    });
}