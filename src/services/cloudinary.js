// src/services/cloudinary.js

/**
 * Faz o upload de uma imagem para o Cloudinary de forma unauthenticated.
 * Requer que você tenha configurado um "Upload Preset" no Cloudinary como "Unsigned".
 * 
 * @param {File} file - Arquivo de imagem selecionado via input
 * @returns {Promise<string>} - A URL segura da imagem hospedada
 */
export async function uploadImageToCloudinary(file) {
  // ATENÇÃO: Substitua pelas suas credenciais reais ou use variáveis de ambiente (.env)
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'seu_cloud_name_aqui';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'seu_upload_preset_aqui';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro ao fazer upload da imagem.');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Erro no upload para Cloudinary:", error);
    throw error;
  }
}
