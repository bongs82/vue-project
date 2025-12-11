async function h(r){const a=new TextEncoder().encode(r),s=await crypto.subtle.digest("SHA-256",a);return Array.from(new Uint8Array(s)).map(t=>t.toString(16).padStart(2,"0")).join("")}export{h};
