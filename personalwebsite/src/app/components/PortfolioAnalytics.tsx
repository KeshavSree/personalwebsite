"use client";

import {useEffect,useRef} from "react";
import {Analytics} from "@vercel/analytics/next";
import {track} from "@vercel/analytics";

const sections=new Set(["work","projects","involvement","about"]);

/** Hash navigation is one Next.js page, so track its public views explicitly. */
export default function PortfolioAnalytics(){
  const lastView=useRef<string|null>(null);
  useEffect(()=>{
    const view=()=>{
      if(window.location.pathname!=="/")return;
      const [category,activity,...rest]=window.location.hash.slice(1).split("/");
      if(category&&!sections.has(category))return;
      if(rest.length||(activity&&!/^[a-z0-9-]{1,80}$/.test(activity)))return;
      const section=category||"home",key=activity?`${section}/${activity}`:section;
      if(key===lastView.current)return;
      const previousSection=lastView.current?.split("/")[0];
      lastView.current=key;
      if(section!==previousSection)track("Section Viewed",{section});
      if(activity)track("Activity Opened",{section,activity});
    };
    const click=(event:MouseEvent)=>{
      if(event.button!==0||!(event.target instanceof Element))return;
      const link=event.target.closest<HTMLAnchorElement>("a[href]");
      if(!link)return;
      const destination=new URL(link.href,window.location.href);
      const external=destination.origin!==window.location.origin&&/^https?:$/.test(destination.protocol);
      const resume=destination.origin===window.location.origin&&/^\/resume(?:\.pdf)?$/.test(destination.pathname);
      const email=destination.protocol==="mailto:";
      if(!external&&!resume&&!email)return;
      const section=window.location.pathname==="/"?(window.location.hash.slice(1).split("/")[0]||"home"):window.location.pathname;
      track("Link Clicked",{
        section,
        label:(link.getAttribute("aria-label")||link.textContent||"Link").replace(/\s+/g," ").trim().slice(0,80),
        // Exclude query strings, invitation codes and email addresses.
        destination:email?"email":resume?"resume":`${destination.hostname}${destination.pathname}`.slice(0,180),
      });
    };
    view();
    window.addEventListener("hashchange",view);
    window.addEventListener("popstate",view);
    document.addEventListener("click",click,true);
    return()=>{
      window.removeEventListener("hashchange",view);
      window.removeEventListener("popstate",view);
      document.removeEventListener("click",click,true);
    };
  },[]);
  return <Analytics/>;
}
