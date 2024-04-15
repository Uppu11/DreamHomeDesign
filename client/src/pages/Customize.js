import axios from "axios";
import React, { useState } from "react";


import { toast } from "sonner";
// import Select from "react-select";
// import { useDropzone } from "react-dropzone";
import { Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";


const Customize = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const initialProductState = {
        name: "",
        price: "",
        description: "",
        category: "",
        sizes: [],
        color: [],
        quantity: 0,
        availability: false,
        images: [], // New field for handling multiple images
        uploaded_images: [], // New field for handling multiple images
    };
    // ** States
    const [productData, setProductData] = useState(initialProductState);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [color, setColor] = useState([]);


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setProductData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
            category: name === "category" ? value : prevData.category, // Change here
            // color: name === "colors" ? [value] : prevData.color, // Change here
            color:
                name === "color" && type === "checkbox"
                    ? checked
                        ? [...prevData.color, value]
                        : prevData.color.filter((color) => color !== value)
                    : prevData.color, // Add this line for sizes


            sizes:
                name === "sizes" && type === "checkbox"
                    ? checked
                        ? [...prevData.sizes, value]
                        : prevData.sizes.filter((size) => size !== value)
                    : prevData.sizes, // Add this line for sizes
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        setProductData((prevData) => ({
            ...prevData,
            img: file,
        }));
    };

    const handleSizeChange = (newValue) => {
        console.log("🚀 ~ handleSizeChange ~ newValue:", newValue);
        setSizes(newValue);
    };

    const handleColorChange = (newValue) => {
        console.log("🚀 ~ handleColorChange ~ newValue:", newValue);
        setColor(newValue);
    };

    const categoryOptions = [
        "Bridal Dress",
        "Saree",
        "Lehenga",
        "Dresses",
        "Kurta",
    ];
    const handleManageProduct = () => {
        navigate("/admin/manage-products");
    };


    const onDrop = async (acceptedFiles) => {
        // Ensure acceptedFiles is an array of File objects
        const validFiles = acceptedFiles.filter((file) => file instanceof File);

        //-- Upload images to server
        const formData = new FormData();
        validFiles.forEach((image) => {
            formData.append("images", image);

        });

        const response = await axios.post(
            "http://localhost:5000/api/upload-product-images",
            formData,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        if (response.status === 200) {
            const oldImages = uploadedImages;
            response.data.forEach((imageName) => {
                oldImages.push(imageName);
            });
            setUploadedImages(oldImages);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // try {
        const formData = new FormData();

        // Append each field individually
        formData.append("name", productData.name);
        formData.append("price", productData.price);

        formData.append("description", productData.description);
        formData.append("category", productData.category);
        formData.append("quantity", productData.quantity);
        formData.append("availability", productData.availability);

        // Append sizes and colors as arrays
        sizes.forEach((size) => formData.append("sizes", size.value));
        // productData.color.forEach((color) => formData.append("color", color));
        color.forEach((color) => formData.append("color", color.value));


        var images_sendings = []

        uploadedImages.forEach((image) => {
            formData.append("image_names[]", image);
        });




        const response = await axios.post(
            "http://localhost:5000/api/add-new-product",
            formData,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            }
        );


        // Reset the form after submission
        setProductData(initialProductState);
        toast.success("Product added successfully");
        navigate("/admin/manage-products");
    };

    const handleImageRemove = async (imageFileName) => {
        const response = await axios.delete(
            `http://localhost:5000/api/remove-product-image/none/${imageFileName}`,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        console.log("🚀 ~ handleImageRemove ~ response:", response);
        if (response.status === 200) {
            const newImages = [];
            uploadedImages.forEach((uploadSingleImage) => {
                if (uploadSingleImage !== imageFileName) {
                    newImages.push(uploadSingleImage);
                }
            });
            setUploadedImages(newImages);
            toast.success("Image Removed");
        }
    };

    return (
        <div className='home bg-pro-white flex flex-col flex-grow ml-64'>

            <div className="flex flex-col flex-grow">

                <div className="flex justify-between items-center px-4 py-2 ">
                    <h3 className="text-2xl font-[Elephant] text-custom-green hover:text-custom-green font-bold transition duration-300 ease-in-out">
                        {id ? "Update Product" : "Add Product"}
                    </h3>
                    <div>
                        <button
                            onClick={handleManageProduct}
                            className="bg-custom-green hover:bg-green-900 text-white px-4 py-2  rounded transition duration-300"
                        >
                            Manage Products
                        </button>
                    </div>
                </div>
                <hr className="border-t border-gray-500 mx-4" />

                <form
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                    className="space-y-4 w-full"
                >
                    <div className="flex p-10 flex-wrap justify-center w-full">
                        {/* First Column */}
                        <div className="w-full sm:w-1/2 p-4 ">
                            {/* Name */}
                            <div className="flex flex-col mb-4">
                                <label
                                    htmlFor="name"
                                    className="font-bold text-pastel-green hover:text-custom-green transition duration-300 ease-in-out"
                                >
                                    Name:
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={productData.name}
                                    onChange={handleInputChange}
                                    className="mt-1 py-2 px-3 border rounded-md text-sm leading-5 text-gray-700 focus:outline-none focus:border-pastel-green focus:ring focus:ring-pastel-green"
                                />
                            </div>

                            {/* Quantity */}
                            <div className="flex flex-col mb-4">
                                <label
                                    htmlFor="quantity"
                                    className="font-bold text-pastel-green hover:text-custom-green transition duration-300 ease-in-out"
                                >
                                    Quantity:
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={productData.quantity}
                                    onChange={handleInputChange}
                                    className="mt-1 py-2 px-3 border rounded-md text-sm leading-5 text-gray-700 focus:outline-none focus:border-pastel-green focus:ring focus:ring-pastel-green"
                                />
                            </div>


                            {/* Size */}
                            <div className="flex flex-col mb-4">
                                <label
                                    htmlFor="sizes"
                                    className="font-bold text-pastel-green hover:text-custom-green transition duration-300 ease-in-out"
                                >
                                    Sizes:
                                </label>
                                <div className="flex mt-1">
                                    <Select
                                        // defaultValue={"XL"}
                                        isMulti
                                        name="colors"
                                        options={[
                                            { value: "S", label: "Small" },
                                            { value: "M", label: "Medium" },
                                            { value: "L", label: "Large" },
                                            { value: "XL", label: "Extra Large" },
                                        ]}
                                        className="w-100"
                                        classNamePrefix="select"
                                        value={sizes}
                                        onChange={handleSizeChange}
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div className="flex flex-col mb-4">
                                <label
                                    htmlFor="category"
                                    className="font-bold text-pastel-green hover:text-custom-green transition duration-300 ease-in-out"
                                >
                                    Category:
                                </label>
                                <select
                                    name="category"
                                    value={productData.category}
                                    onChange={handleInputChange}
                                    className="mt-1 py-2 px-3 border rounded-md text-sm leading-5 text-gray-700 focus:outline-none focus:border-pastel-green focus:ring focus:ring-pastel-green"
                                >
                                    <option value="" disabled>
                                        Select Category
                                    </option>
                                    {categoryOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            {/* Color */}
                            <div className="flex flex-col mb-4">
                                <label
                                    htmlFor="color"
                                    className="font-bold text-pastel-green hover:text-custom-green transition duration-300 ease-in-out"
                                >
                                    Colors:
                                </label>
                                <Select
                                    isMulti
                                    name="color"
                                    options={[
                                        { value: "Red", label: "Red" },
                                        { value: "White", label: "White" },
                                        { value: "Blue", label: "Blue" },
                                        { value: "Purple", label: "Purple" },
                                    ]}
                                    className="w-100"
                                    classNamePrefix="select"
                                    value={color}
                                    onChange={handleColorChange}
                                />
                            </div>

                            {/* Price */}
                            <div className="flex flex-col mb-4">
                                <label
                                    htmlFor="price"
                                    className="font-bold text-pastel-green hover:text-custom-green transition duration-300 ease-in-out"
                                >
                                    Price:
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={productData.price}
                                    onChange={handleInputChange}
                                    className="mt-1 py-2 px-3 border rounded-md text-sm leading-5 text-gray-700 focus:outline-none focus:border-pastel-green focus:ring focus:ring-pastel-green"
                                />
                            </div>
                        </div>

                        {/* Second Column */}
                        <div className="w-full sm:w-1/2 p-4">
                            {/* Description */}
                            <div className="flex flex-col mb-4">
                                <label
                                    htmlFor="description"
                                    className="font-bold text-pastel-green hover:text-custom-green transition duration-300 ease-in-out"
                                >
                                    Description:
                                </label>
                                <textarea
                                    name="description"
                                    value={productData.description}
                                    onChange={handleInputChange}
                                    className="mt-1 py-7 px-3 border rounded-md text-sm leading-5 text-gray-700 focus:outline-none focus:border-pastel-green focus:ring focus:ring-pastel-green"
                                />
                            </div>

                            <div className="flex  mb-4">
                                <div className="flex-col">
                                    <label
                                        htmlFor="images"
                                        className="font-bold text-pastel-green hover:text-custom-green transition duration-300 ease-in-out"
                                    >
                                        Images:
                                    </label>
                                    <div
                                        {...getRootProps()}
                                        className={`mt-1 py-10 px-16 border rounded-md text-sm leading-5 text-gray-700 focus:outline-none ${isDragActive ? "border-pastel-green" : ""
                                            }`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "200px", // Set the width as per your requirement
                                            height: "200px", // Set the height as per your requirement
                                            objectFit: "cover", // Optional: Hide overflow if the image is larger
                                            overflow: "hidden",
                                        }}
                                    >
                                        <input {...getInputProps()} />
                                        {isDragActive ? (
                                            <p>Drop the files here ...</p>
                                        ) : productData.images.length > 0 ? (
                                            <div>
                                                {productData.images.map((image, index) => (

                                                    <img
                                                        key={index}
                                                        src={
                                                            image instanceof File
                                                                ? URL.createObjectURL(image)
                                                                : image
                                                        }
                                                        alt={`Uploaded ${index}`}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                            marginBottom: "8px",
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <p>
                                                Drag 'n' drop some files here, or click to select files
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center p-1">
                                    {uploadedImages.map((imageName) => {
                                        return (
                                            <div key={imageName}>
                                                <img
                                                    alt=""
                                                    src={`http://localhost:5000/uploads/${imageName}`}
                                                    style={{
                                                        height: "120px",
                                                    }}
                                                    className="p-1"
                                                />
                                                <button
                                                    className="btn"
                                                    type="button"
                                                    onClick={() => {
                                                        handleImageRemove(imageName);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="bg-pastel-green text-white px-8 py-2 rounded-md hover:bg-custom-green focus:outline-none focus:ring focus:ring-pastel-green"
                            >
                                {id ? "Update Product" : "Add Product"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Customize;