import {
  Button,
  Form,
  FormProps,
  Image,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { LangContext } from "../../contexts/LangContext";
import { uploadFileToTemp } from "../../services/fileService";
import { FiTrash2 } from "react-icons/fi";
import { PlusOutlined } from "@ant-design/icons";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { Option } from "antd/es/mentions";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import {
  createProduct,
  getProductById,
  updateProduct,
} from "../../services/productService";
import Formatter from "../../util/format/Formatter";
import TextArea from "antd/es/input/TextArea";
import { useNavigate } from "react-router-dom";

type FieldType = {
  name: string;
  description: string;
  price: number;
  discountValue: number;
  discountType: string;
  inventory: number;
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

type ProductEditorProps = {
  action: "create" | "edit";
  id?: string;
  onComplete?: () => void;
};

const ProductEditor = ({ action, id, onComplete }: ProductEditorProps) => {
  const [, context] = message.useMessage();
  const { trans } = useContext(LangContext);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [price, setPrice] = useState(0);
  const navigate = useNavigate();
  const [discount, setDiscount] = useState<Discount>({
    type: "percent",
    value: 0,
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [imgList, setImgList] = useState<
    { filepath: string; uid_temp: string }[]
  >([]);

  const handleUploadPreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleUploadAction = async (file: RcFile) => {
    const path = await uploadFileToTemp(file, "product");
    setImgList((prev) => [...prev, { filepath: path, uid_temp: file.uid }]);
    return path;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRemoveImage = (file: UploadFile<any> | string) => {
    // filter out the removed image
    if (typeof file === "string") {
      console.log("remove image", file);
      setImgList((prev) => prev.filter((img) => img.filepath !== file));
      console.log(imgList);
      return;
    }

    setImgList((prev) => prev.filter((img) => img.uid_temp !== file.uid));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUploadChange = (info: UploadChangeParam<UploadFile<any>>) => {
    const { status } = info.file;
    if (status !== "uploading") {
      console.log(info.file, info.fileList);
      message.loading(`${info.file.name} file uploading...`);
    }
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { name, description, inventory } = values;

    const images = imgList.map((img) => img.filepath);

    try {
      const result = await (action === "edit" && product
        ? updateProduct(
            {
              name,
              description,
              price,
              discount,
              images,
              inventory,
            },
            product._id,
          )
        : createProduct({
            name,
            description,
            price,
            discount,
            images,
            inventory,
          }));

      const id = product?._id || (result as IProduct)._id;

      if (result) {
        message.success(
          action === "edit"
            ? "Update product successfully"
            : "Create product successfully",
        );
        onComplete && onComplete();
        navigate(`/order/product/${id}`);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to create product");
    }
  };

  useEffect(() => {
    if (action === "edit" && id) {
      const fetchData = async () => {
        const product = await getProductById(id);
        setProduct(product);
        setPrice(product.price);
        setImgList(
          product.images.map((img) => ({ filepath: img, uid_temp: "" })) || [],
        );
      };

      fetchData();
    }
  }, [action, id]);
  return (
    <>
      {context}

      <Form
        key={product?._id || "create"}
        name="product"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{
          name: product?.name || "",
          description: product?.description || "",
          price: product?.price || 0,
          discountValue: product?.discount.value || 0,
          discountType: product?.discount.type || "percent",
          inventory: product?.inventory || 0,
        }}
        onFinish={handleFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="on"
      >
        <Form.Item<FieldType>
          label={trans({ en: "Product name", vi: "Tên sản phẩm" })}
          name="name"
          rules={[
            {
              required: true,
              message: trans({
                en: "Please input Product Name",
                vi: "Hãy nhập Tên Sản Phẩm",
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label={trans({ en: "Product description", vi: "Mô tả sản phẩm" })}
          name="description"
          rules={[
            {
              required: true,
              message: trans({
                en: "Please input Product Description",
                vi: "Hãy nhập Mô Tả Sản Phẩm",
              }),
            },
          ]}
        >
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item<FieldType>
          label={trans({ en: "Product Price", vi: "Giá thành sản phẩm" })}
          name="price"
          rules={[
            {
              required: true,
              min: 0,
              type: "number",
              message: trans({
                en: "Please input Product Price",
                vi: "Hãy nhập Giá Sản Phẩm",
              }),
            },
          ]}
        >
          <InputNumber
            className="w-full"
            size="large"
            value={price}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) =>
              value?.replace(/\$\s?|(,*)/g, "") as unknown as 0
            }
            onChange={(value) => setPrice(value as number)}
          />
          <span className="italic font-medium text-gray-500">
            {Formatter.numberToPronunciation(price)}
          </span>
        </Form.Item>

        <Form.Item<FieldType>
          label={trans({ en: "Discount", vi: "Discount" })}
          name="discountValue"
        >
          <div className="grid grid-cols-8 gap-4">
            <InputNumber
              disabled={price === 0}
              className="w-full col-span-5"
              type="text"
              min={0}
              max={discount.type === "percent" ? 100 : price}
              value={discount.value}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) =>
                value?.replace(/\$\s?|(,*)/g, "") as unknown as 0
              }
              onChange={(value) => {
                setDiscount((prev) => ({ ...prev, value: value as number }));
              }}
            />
            <Select
              className="col-span-3"
              value={discount.type}
              onChange={(value) =>
                setDiscount((prev) => ({ ...prev, type: value }))
              }
            >
              <Option value="percent">
                {trans({ en: "Percent (%)", vi: "Phần trăm (%)" })}
              </Option>
              <Option value="fixed">
                {trans({ en: "Fixed value (đ)", vi: "Giá trị cố định (đ)" })}
              </Option>
            </Select>
          </div>
          <p>
            {trans({ en: "Discount amount ", vi: "Số tiền giảm giá " })}
            {Formatter.toVND(
              Number(
                discount.type === "percent"
                  ? (price * Number(discount.value)) / 100
                  : Number(discount.value),
              ),
            )}
          </p>
        </Form.Item>

        <Form.Item<FieldType>
          label={trans({ en: "Product Inventory", vi: "Sản phẩm tồn kho" })}
          name="inventory"
          initialValue={0}
          rules={[
            {
              required: false,
              min: 0,
              type: "number",
            },
          ]}
        >
          <InputNumber
            defaultValue={0}
            className="w-full"
            size="large"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) =>
              value?.replace(/\$\s?|(,*)/g, "") as unknown as 0
            }
            onChange={(value) => setPrice(value as number)}
          />
        </Form.Item>

        <Form.Item
          label={trans({ en: "Product images", vi: "Hình ảnh sản phẩm" })}
        >
          <div className="flex flex-wrap gap-2">
            {product &&
              imgList.map((img, index) => (
                <div className="flex flex-col items-center gap-2 p-2 border rounded-md">
                  <Image
                    key={index}
                    src={img.filepath}
                    alt="product image"
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                  <Button
                    danger
                    block
                    icon={<FiTrash2 />}
                    onClick={() => handleRemoveImage(img.filepath)}
                  ></Button>
                </div>
              ))}
          </div>
          <Upload
            action={handleUploadAction}
            onChange={handleUploadChange}
            listType="picture-card"
            showUploadList
            hasControlInside
            onPreview={handleUploadPreview}
            onRemove={handleRemoveImage}
            className="my-2"
          >
            <button style={{ border: 0, background: "none" }} type="button">
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </button>
          </Upload>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 24 }}>
          <div className="flex items-end justify-end gap-2 mr-16 md:mr-0">
            <Button
              block
              size="large"
              type="primary"
              className="mt-2 bg-primary"
              htmlType="submit"
            >
              {trans(
                action === "create"
                  ? { en: "Create product", vi: "Tạo sản phẩm" }
                  : { en: "Update product", vi: "Cập nhật sản phẩm" },
              )}
            </Button>
          </div>
        </Form.Item>
      </Form>

      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </>
  );
};

export default ProductEditor;
