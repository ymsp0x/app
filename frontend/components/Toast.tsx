import { useEffect } from "react";
export default function Toast({show, msg, onHide}:{show:boolean, msg:string, onHide:()=>void}) {
  useEffect(() => { if (show) setTimeout(onHide, 2500); }, [show]);
  if (!show) return null;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-2 rounded-xl shadow-lg z-50 animate-fadein">
      {msg}
    </div>
  );
}
