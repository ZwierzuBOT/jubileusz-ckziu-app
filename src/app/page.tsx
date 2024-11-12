'use client';
import { useState, ChangeEvent, DragEvent, useEffect, FormEvent } from 'react';
import { SignedIn, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [dropFocused, setDropFocused] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [parentName, setParentName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [totalFileSize, setTotalFileSize] = useState(0);
  
  const { user } = useUser();
  const router = useRouter();
  
  const MAX_FILE_NAME_LENGTH = 30;
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024; 

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

  const calculateTotalFileSize = (files: File[]) => {
    return files.reduce((acc, file) => acc + file.size, 0);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const newFiles = [...files, ...selectedFiles];
      setFiles(newFiles);
      setFileNames((prevFileNames) => [
        ...prevFileNames,
        ...selectedFiles.map((file) => truncateFileName(file.name)),
      ]);
      setTotalFileSize(calculateTotalFileSize(newFiles));
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

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const newFiles = [...files, ...droppedFiles];
      setFiles(newFiles);
      setFileNames((prevFileNames) => [
        ...prevFileNames,
        ...droppedFiles.map((file) => truncateFileName(file.name)),
      ]);
      setTotalFileSize(calculateTotalFileSize(newFiles));
    }
  };

  const handleDeleteFile = (fileName: string) => {
    const updatedFiles = files.filter(file => file.name !== fileName);
    setFileNames((prevFileNames) => prevFileNames.filter(name => name !== fileName));
    setFiles(updatedFiles);
    setTotalFileSize(calculateTotalFileSize(updatedFiles));
  };

  const handleSubmit = async (e: FormEvent<HTMLElement>) => {
    e.preventDefault();
  
    const formData = new FormData();
  
    // Append the form data
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('schoolName', schoolName);
    formData.append('parentName', parentName);
  
    // Append the files
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput && fileInput.files) {
      Array.from(fileInput.files).forEach((file) => {
        formData.append('attachments', file);
      });
    }
  
    try {
      const response = await fetch('https://jubileusz-ckziu.vercel.app/api/sendEmail', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        alert('Email sent successfully');
      } else {
        alert('Error sending email');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending email');
    }
  };
  
  
  
  useEffect(() => {
    if (!user){
      router.push("/sign-in");
    }
  }, [user, router]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[87vh] flex flex-col justify-center items-center">
        <div className="lg:w-[10%] md:w-[15%] sm:w-[40%] w-[40%] h-[10%] flex justify-evenly items-center">
          <div className="loadingPart loadingPart1 max-w-4 min-w-2 h-[50%] "></div>
          <div className="loadingPart loadingPart2 max-w-4 min-w-2 h-[50%] "></div>
          <div className="loadingPart loadingPart3 max-w-4 min-w-2 h-[50%] "></div>
          <div className="loadingPart loadingPart4 max-w-4 min-w-2 h-[50%] "></div>
          <div className="loadingPart loadingPart5 max-w-4 min-w-2 h-[50%] "></div>
        </div>
        <h1 className="text-gray-700 lg:text-3xl md:text-2xl sm:text-xl">Prosze Czekać</h1>
      </div>
    );
  } else {
    return (
      <SignedIn>
      <div
        className="flex justify-center lg:items-center md:items-center sm:items-start items-start w-full h-screen p-4"
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
              className="mb-2 p-2 rounded-lg text-black w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Nazwisko"
              className="mb-2 p-2 rounded-lg text-black w-full"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Imię opiekuna szkolnego"
              className="mb-2 p-2 rounded-lg text-black w-full"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Szkoła"
              className="mb-4 p-2 rounded-lg text-black w-full"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
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
            <p className={totalFileSize > MAX_TOTAL_SIZE ? 'text-red-500' : 'text-gray-100'}>
              Pliki nie mogą przekraczać 50mb
            </p>
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
            <button
              type="submit"
              className={`mt-4 text-white rounded-lg py-2 ${totalFileSize > MAX_TOTAL_SIZE ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700'}`}
              disabled={totalFileSize > MAX_TOTAL_SIZE}
            >
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
      </SignedIn>
    );
  }
}
