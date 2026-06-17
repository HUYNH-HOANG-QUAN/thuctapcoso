package com.doan.ProFit.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "product_tag_map")
@IdClass(ProductTagMap.ProductTagMapId.class)
public class ProductTagMap {

    @Id
    @Column(name = "product_id")
    private Long productId;

    @Id
    @Column(name = "tag_id")
    private Long tagId;

    public ProductTagMap() {}

    public ProductTagMap(Long productId, Long tagId) {
        this.productId = productId;
        this.tagId = tagId;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getTagId() { return tagId; }
    public void setTagId(Long tagId) { this.tagId = tagId; }

    public static class ProductTagMapId implements Serializable {
        private Long productId;
        private Long tagId;

        public ProductTagMapId() {}

        public ProductTagMapId(Long productId, Long tagId) {
            this.productId = productId;
            this.tagId = tagId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ProductTagMapId that = (ProductTagMapId) o;
            return productId != null && productId.equals(that.productId)
                    && tagId != null && tagId.equals(that.tagId);
        }

        @Override
        public int hashCode() {
            return 31 * (productId != null ? productId.hashCode() : 0)
                    + (tagId != null ? tagId.hashCode() : 0);
        }
    }
}
