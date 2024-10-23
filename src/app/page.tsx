'use client';
import { useState, ChangeEvent, DragEvent } from 'react';

export default function Home() {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [dropFocused, setDropFocused] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [className, setClassName] = useState('');

  const MAX_FILE_NAME_LENGTH = 30; 


  const truncateFileName = (fileName: string) => {
    return fileName.length > MAX_FILE_NAME_LENGTH 
      ? `${fileName.slice(0, MAX_FILE_NAME_LENGTH)}...` 
      : fileName;
  };

  const getFileCountLabel = (fileCount: number) => {
    if (fileCount === 0) return 'Wybierz pliki';
    if (fileCount === 1) return '1 plik wybrany';
    if (fileCount > 1 && fileCount < 5) return `${fileCount} pliki wybrane`;
    return `${fileCount} plików wybranych`;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const truncatedNames = files.map((file) => truncateFileName(file.name));
      setFileNames((prevFileNames) => [...prevFileNames, ...truncatedNames]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDropFocused(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropFocused(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDropFocused(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const truncatedNames = files.map((file) => truncateFileName(file.name));
      setFileNames((prevFileNames) => [...prevFileNames, ...truncatedNames]);
    }
  };

  const handleDeleteFile = (fileName: string) => {
    setFileNames((prevFileNames) => prevFileNames.filter(name => name !== fileName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //TUTAJ DALEJ COS
    console.log({ name, surname, className, fileNames });
  };

  return (
    <div
      className="flex justify-center items-center w-full h-screen p-4"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="w-full max-w-md bg-blue-500 rounded-3xl p-6 flex flex-col">
        <h1 className="text-white text-2xl text-center mb-4">Formularz przesyłania</h1>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="text"
            placeholder="Imię"
            className="mb-2 p-2 rounded-lg text-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Nazwisko"
            className="mb-2 p-2 rounded-lg text-black"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Klasa"
            className="mb-4 p-2 rounded-lg text-black"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          />
          <div className="h-1/2 flex justify-center items-end w-full mb-4 ">
            <div className="w-full rounded-lg bg-[#efefef] flex flex-col items-center justify-center hover:bg-gray-300 transition-all duration-500">
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="text-black cursor-pointer w-full h-full flex items-center justify-center p-4"
              >
                {getFileCountLabel(fileNames.length)}
              </label>
            </div>
          </div>
          <div className="h-1/2 flex flex-col items-center justify-center">
            <ul className="text-white list-disc pl-5">
              {fileNames.map((fileName, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{fileName}</span>
                  <button
                    className="ml-2 text-red-500 hover:underline"
                    onClick={() => handleDeleteFile(fileName)}
                    type="button"
                  >
                    Usuń
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button type="submit" className="mt-4 bg-blue-700 text-white rounded-lg py-2">
            Prześlij
          </button>
        </form>

        <div className={`mt-4 p-4 border-2 border-dashed ${dropFocused ? "border-blue-500" : "border-gray-300"} rounded-lg text-center`}>
          {dropFocused ? (
            <div className="bg-yellow-200 p-2 rounded-lg">
              <span className="text-blue-500 font-bold">Upuść pliki tutaj!</span>
            </div>
          ) : (
            <span>Przeciągnij pliki tutaj, aby je przesłać</span>
          )}
        </div>
      </div>
    </div>
  );
}
