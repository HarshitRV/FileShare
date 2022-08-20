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
        if(navigator.canShare){
            try{
                await navigator.share(shareData);
            }catch(err){
                console.log(err);
            }
        } else {
            alert('Your browser does not support the Share API');
        }
    });

    copyToClipboard.addEventListener('click', async ()=> {
        if(window.location.protocol != 'https:') return alert('HTTPS is required to copy to clipboard');
        await navigator.clipboard.writeText(shareLink.textContent);
        console.log(navigator.clipboard);
        alert('Copied to clipboard');
    });
}