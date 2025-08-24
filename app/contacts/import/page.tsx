"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import FileUploader from "@/components/contacts/FileUploader";
import ColumnMapper from "@/components/contacts/ColumnMapper";
import ValidationResults from "@/components/contacts/ValidationResults";

export default function ImportContactsPage() {
  const [step, setStep] = useState<"upload" | "map" | "validate">("upload");
  const [fileData, setFileData] = useState<{
    sheets: Array<{ name: string; rows: Array<Array<string>> }>;
    activeSheetIndex: number;
  } | null>(null);
  const [mapping, setMapping] = useState<{
    firstName?: number;
    lastName?: number;
    email?: number;
    phone?: number;
  }>({});

  return (
    <main className="max-w-5xl mx-auto p-6">
      <Card className="shadow">
        <CardHeader>
          <CardTitle>Importera kontakter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={step} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">1. Ladda upp</TabsTrigger>
              <TabsTrigger value="map" disabled={!fileData}>
                2. Mappa kolumner
              </TabsTrigger>
              <TabsTrigger value="validate" disabled={!fileData}>
                3. Validera
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {step === "upload" && (
            <FileUploader
              onParsed={(parsed) => {
                setFileData(parsed);
                setStep("map");
              }}
            />
          )}
          {step === "map" && fileData && (
            <ColumnMapper
              fileData={fileData}
              mapping={mapping}
              onChangeMapping={(m: {
                firstName?: number;
                lastName?: number;
                email?: number;
                phone?: number;
              }) => setMapping(m)}
              onNext={() => setStep("validate")}
            />
          )}
          {step === "validate" && fileData && (
            <ValidationResults fileData={fileData} mapping={mapping} />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
