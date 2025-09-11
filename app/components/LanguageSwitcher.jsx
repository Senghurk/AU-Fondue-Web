"use client";

import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {language === "en" ? "EN" : "TH"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className={language === "en" ? "bg-accent" : ""}
        >
          <span className="mr-2">🇬🇧</span>
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("th")}
          className={language === "th" ? "bg-accent" : ""}
        >
          <span className="mr-2">🇹🇭</span>
          ภาษาไทย
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}