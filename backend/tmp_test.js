(async()=>{ // using built-in fetch available in Node 18+

  try{
    const res = await fetch('http://localhost:3000/api/auth/signin',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({username:'admin', password:'admin123'})
    });
    console.log('status',res.status);
    const data = await res.text();
    console.log('body',data);
  } catch(e){ console.error(e); }
})();