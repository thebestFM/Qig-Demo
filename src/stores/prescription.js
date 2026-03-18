import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePrescriptionStore = defineStore('prescription', () => {
  // 当前处方
  const currentPrescription = ref(null)

  // 处方列表
  const prescriptions = ref([
    {
      id: 1,
      name: '逍遥散',
      herbs: [
        { name: '柴胡', dose: '10g', nature: '苦辛微寒', meridian: '归肝、胆经', effect: '疏肝解郁', caution: '阴虚阳亢者慎用' },
        { name: '当归', dose: '10g', nature: '甘辛温', meridian: '归肝、心、脾经', effect: '补血活血', caution: '便溏者慎用' },
        { name: '白芍', dose: '10g', nature: '苦酸微寒', meridian: '归肝、脾经', effect: '养血柔肝', caution: '阳虚者慎用' },
        { name: '白术', dose: '10g', nature: '苦甘温', meridian: '归脾、胃经', effect: '健脾益气', caution: '阴虚内热者慎用' },
        { name: '茯苓', dose: '10g', nature: '甘淡平', meridian: '归心、脾、肾经', effect: '利水渗湿', caution: '阴虚者慎用' },
        { name: '甘草', dose: '5g', nature: '甘平', meridian: '归心、肺、脾、胃经', effect: '调和诸药', caution: '湿盛胀满者慎用' }
      ],
      summary: '疏肝解郁,健脾养血',
      keyPoints: ['疏肝理气', '健脾养血', '调和肝脾'],
      warnings: ['孕妇慎用', '阴虚者需配伍滋阴药物', '长期服用需医师指导'],
      references: [
        { source: '《太平惠民和剂局方》', content: '逍遥散治血虚劳倦,五心烦热...' },
        { source: '《中医方剂学》', content: '本方为调和肝脾的名方...' }
      ]
    }
  ])

  // 设置当前处方
  const setCurrentPrescription = (prescription) => {
    currentPrescription.value = prescription
  }

  // Mock OCR识别处方
  const recognizePrescription = (imageFile) => {
    // 模拟OCR识别
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(prescriptions.value[0])
      }, 1500)
    })
  }

  return {
    currentPrescription,
    prescriptions,
    setCurrentPrescription,
    recognizePrescription
  }
})
