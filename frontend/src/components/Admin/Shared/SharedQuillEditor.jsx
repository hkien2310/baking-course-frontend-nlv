import React, { useRef, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { uploadImage } from '../../../services/api';
import { imageUrl } from '../../../utils/imageUrl';
import { toast } from 'react-toastify';

const SharedQuillEditor = ({ value, onChange, placeholder, style }) => {
  const reactQuillRef = useRef(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const toastId = toast.loading("Đang tải ảnh lên...");
        try {
          const result = await uploadImage(file);
          if (result && result.url) {
            const quill = reactQuillRef.current.getEditor();
            const range = quill.getSelection(true);
            const fullUrl = imageUrl(result.url);
            quill.insertEmbed(range.index, 'image', fullUrl);
            quill.setSelection(range.index + 1);
            toast.update(toastId, { render: "Tải ảnh thành công!", type: "success", isLoading: false, autoClose: 2000 });
          } else {
             throw new Error("No URL returned");
          }
        } catch (error) {
          console.error('Error uploading image', error);
          toast.update(toastId, { render: "Không thể tải ảnh lên. Vui lòng thử lại!", type: "error", isLoading: false, autoClose: 3000 });
        }
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler]);

  const formats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'link', 'image', 'video'
  ];

  return (
    <ReactQuill
      ref={reactQuillRef}
      theme="snow"
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder || 'Nhập nội dung...'}
      style={style || { height: '300px', marginBottom: '50px' }}
      modules={modules}
      formats={formats}
    />
  );
};

export default SharedQuillEditor;
