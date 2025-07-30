import React, { useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileImgUpload {
  currentImage?: string;
  onImageChange: (image: string) => void;
}

export const ProfileImageUpload: React.FC<ProfileImgUpload> = ({
  currentImage,
  onImageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageChange(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="relative group">
        <Avatar className="w-32 h-32 shadow-soft border-4 border-white">
          <AvatarImage src={currentImage} alt="Profile" />
          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
            <Camera className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        
        {currentImage && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full shadow-soft opacity-0 group-hover:opacity-100 transition-smooth"
            onClick={removeImage}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 w-full max-w-md text-center transition-smooth ${
          isDragging
            ? "border-primary bg-accent/50"
            : "border-border hover:border-primary/50 hover:bg-accent/20"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-accent rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-accent-foreground" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground">
              Drop your image here, or{" "}
              <span className="text-primary cursor-pointer hover:underline">
                browse
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="transition-smooth hover:shadow-soft"
        >
          <Camera className="w-4 h-4 mr-2" />
          Choose Photo
        </Button>
        
        {currentImage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={removeImage}
            className="text-destructive hover:bg-destructive/10 transition-smooth"
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};