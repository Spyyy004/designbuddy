import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;
const FormInput = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1em;
  margin-bottom: 10px;
`;

const FormLabel = styled.label`
  font-size: 1.1em;
  color: #333;
  margin-bottom: 5px;
  display: block;
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1em;
  margin-bottom: 10px;
  resize: vertical;
`;

const HeaderTitle = styled.h1`
  font-size: 2.5em;
  color: #333;
  margin: 0;
`;

const HeaderDescription = styled.p`
  font-size: 1.1em;
  color: #666;
`;

const Form = styled.form`
  background-color: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const DropArea = styled.div`
  border: 2px dashed #007bff;
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  position: relative;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const PlusIcon = styled.div`
  font-size: 3em;
  color: #007bff;
`;

const UploadedImages = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const ImagePreview = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  background-color: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImageElement = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  background-color: #007bff;
  color: #fff;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  margin: 20px 0;
  font-size: 1.2em;
  color: #007bff;
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  margin: 20px 0;
  font-size: 1.2em;
`;

const CaseStudy = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
`;

const CopyButton = styled.button`
  background-color: #28a745;
  color: #fff;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
`;

const CaseStudyForm = () => {
  const [images, setImages] = useState([]);
  const [thoughtProcess, setThoughtProcess] = useState('');
  const [resultAchieved, setResultAchieved] = useState('');
  const [caseStudy, setCaseStudy] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length <= 3) {
      setImages((prevImages) => [...prevImages, ...files]);
    } else {
      setError('You can only upload up to 3 images.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (images.length + files.length <= 3) {
      setImages((prevImages) => [...prevImages, ...files]);
    } else {
      setError('You can only upload up to 3 images.');
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });
      formData.append('thoughtProcess', thoughtProcess);
      formData.append('resultAchieved', resultAchieved);

      const response = await axios.post('http://localhost:5001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { caseStudyText } = response.data;
      setCaseStudy(caseStudyText);
    } catch (error) {
      setError('Failed to generate case study.');
    }

    setLoading(false);
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>Design Case Study Generator</HeaderTitle>
        <HeaderDescription>
          Upload your design screenshot and describe your thought process and the results achieved. We'll generate a detailed case study for you.
        </HeaderDescription>
      </Header>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <DropArea
            onClick={() => document.getElementById('image-upload').click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <PlusIcon>+</PlusIcon>
            <p>Drag & drop or click to upload (Max 3 images)</p>
            <FormInput
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              multiple
              style={{ display: 'none' }}
            />
          </DropArea>
          {images.length > 0 && (
            <UploadedImages>
              {images.map((image, index) => (
                <ImagePreview key={index}>
                  <ImageElement src={URL.createObjectURL(image)} alt={`Upload Preview ${index + 1}`} />
                  <RemoveButton onClick={() => handleRemoveImage(index)}>x</RemoveButton>
                </ImagePreview>
              ))}
            </UploadedImages>
          )}
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="thoughtProcess">Thought Process:</FormLabel>
          <FormTextarea
            id="thoughtProcess"
            value={thoughtProcess}
            onChange={(e) => setThoughtProcess(e.target.value)}
            placeholder="Describe your thought process and design rationale"
            required
          />
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="resultAchieved">Results Achieved:</FormLabel>
          <FormInput
            id="resultAchieved"
            type="text"
            value={resultAchieved}
            onChange={(e) => setResultAchieved(e.target.value)}
            placeholder="Enter any results or outcomes achieved"
            required
          />
        </FormGroup>
        <SubmitButton
          type="submit"
          disabled={loading || images.length === 0}
        >
          {loading ? 'Generating...' : 'Generate Case Study'}
        </SubmitButton>
      </Form>
      {loading && <LoadingSpinner>Loading...</LoadingSpinner>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {caseStudy && (
        <CaseStudy>
          <h2>Generated Case Study</h2>
          <ReactMarkdown>{caseStudy}</ReactMarkdown>
          <CopyButton
            onClick={() => navigator.clipboard.writeText(caseStudy)}
          >
            Copy to Clipboard
          </CopyButton>
        </CaseStudy>
      )}
    </Container>
  );
};

export default CaseStudyForm;
