package expo.modules.hbandble

import android.os.Handler
import android.os.Looper
import androidx.core.os.bundleOf
import com.inuker.bluetooth.library.Code
import com.inuker.bluetooth.library.search.SearchResponse
import com.inuker.bluetooth.library.search.SearchResult
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.base.IConnectResponse
import com.veepoo.protocol.listener.base.INotifyResponse
import com.veepoo.protocol.listener.data.IBatteryDataListener
import com.veepoo.protocol.listener.data.IDeviceFuctionDataListener
import com.veepoo.protocol.listener.data.IPersonInfoDataListener
import com.veepoo.protocol.listener.data.IPwdDataListener
import com.veepoo.protocol.listener.data.ISportDataListener
import com.veepoo.protocol.listener.data.ISocialMsgDataListener
import com.veepoo.protocol.model.datas.BatteryData
import com.veepoo.protocol.model.datas.PersonInfoData
import com.veepoo.protocol.model.datas.SportData
import com.veepoo.protocol.model.enums.ESex
import com.veepoo.protocol.model.enums.EPwdStatus
import com.veepoo.protocol.model.datas.PwdData

class HbandBleModule : Module() {
  private val mainHandler = Handler(Looper.getMainLooper())
  private val context
    get() = appContext.reactContext ?: throw IllegalStateException("React context lost")

  override fun definition() = ModuleDefinition {
    Name("HbandBle")

    Events("onDeviceFound", "onScanStopped", "onConnectionState", "onNotifyState")

    AsyncFunction("init") { promise: Promise ->
      runOnMain {
        try {
          VPOperateManager.getInstance().init(context.applicationContext)
          promise.resolve(null)
        } catch (e: Exception) {
          promise.reject("INIT_FAILED", e.message, e)
        }
      }
    }

    AsyncFunction("startScan") { promise: Promise ->
      runOnMain {
        try {
          VPOperateManager.getInstance().startScanDevice(object : SearchResponse {
            override fun onSearchStarted() {
              promise.resolve(null)
            }
            override fun onDeviceFounded(device: SearchResult?) {
              if (device != null) {
                sendEvent("onDeviceFound", bundleOf(
                  "mac" to (device.address ?: ""),
                  "name" to (device.name ?: ""),
                  "rssi" to device.rssi
                ))
              }
            }
            override fun onSearchStopped() {
              sendEvent("onScanStopped", bundleOf())
            }
            override fun onSearchCanceled() {
              sendEvent("onScanStopped", bundleOf())
            }
          })
        } catch (e: Exception) {
          promise.reject("SCAN_FAILED", e.message, e)
        }
      }
    }

    AsyncFunction("stopScan") { promise: Promise ->
      runOnMain {
        try {
          VPOperateManager.getInstance().stopScanDevice()
          promise.resolve(null)
        } catch (e: Exception) {
          promise.reject("STOP_SCAN_FAILED", e.message, e)
        }
      }
    }

    AsyncFunction("connect") { mac: String, promise: Promise ->
      runOnMain {
        try {
          VPOperateManager.getInstance().connectDevice(
            mac,
            object : IConnectResponse {
              override fun connectState(code: Int, profile: Any?, isOadModel: Boolean) {
                sendEvent("onConnectionState", bundleOf(
                  "code" to code,
                  "success" to (code == Code.REQUEST_SUCCESS)
                ))
                if (code != Code.REQUEST_SUCCESS) {
                  promise.reject("CONNECT_FAILED", "Connection failed with code $code", null)
                }
              }
            },
            object : INotifyResponse {
              override fun notifyState(state: Int) {
                sendEvent("onNotifyState", bundleOf(
                  "state" to state,
                  "success" to (state == Code.REQUEST_SUCCESS)
                ))
                if (state == Code.REQUEST_SUCCESS) {
                  promise.resolve(null)
                } else {
                  promise.reject("NOTIFY_FAILED", "Notify failed with state $state", null)
                }
              }
            }
          )
        } catch (e: Exception) {
          promise.reject("CONNECT_FAILED", e.message, e)
        }
      }
    }

    AsyncFunction("confirmDevicePwd") { pwd: String, is24h: Boolean, promise: Promise ->
      runOnMain {
        try {
          VPOperateManager.getInstance().confirmDevicePwd(
            { code: Int ->
              if (code != Code.REQUEST_SUCCESS) {
                promise.reject("CONFIRM_PWD_FAILED", "Write failed with code $code", null)
              }
            },
            object : IPwdDataListener {
              override fun onPwdDataChange(pwdData: PwdData?) {
                if (pwdData == null) return
                when (pwdData.mStatus) {
                  EPwdStatus.CHECK_SUCCESS, EPwdStatus.CHECK_AND_TIME_SUCCESS, EPwdStatus.SETTING_SUCCESS, EPwdStatus.READ_SUCCESS ->
                    promise.resolve(null)
                  EPwdStatus.CHECK_FAIL -> promise.reject("CONFIRM_PWD_FAILED", "Password check failed", null)
                  else -> promise.reject("CONFIRM_PWD_FAILED", "Status: ${pwdData.mStatus}", null)
                }
              }
            },
            object : IDeviceFuctionDataListener {
              override fun onFunctionSupportDataChange(functionSupport: Any?) { }
            },
            object : ISocialMsgDataListener {
              override fun onSocialMsgSupportDataChange(p0: Any?) { }
              override fun onSocialMsgSupportDataChange2(p0: Any?) { }
            },
            null,
            pwd,
            is24h
          )
        } catch (e: Exception) {
          promise.reject("CONFIRM_PWD_FAILED", e.message, e)
        }
      }
    }

    AsyncFunction("syncPersonInfo") { sex: Int, height: Int, weight: Int, age: Int, stepAim: Int, sleepAim: Int, promise: Promise ->
      runOnMain {
        try {
          val eSex = if (sex == 1) ESex.WOMAN else ESex.MAN
          val personInfo = PersonInfoData(eSex, height, weight, age, stepAim, sleepAim)
          VPOperateManager.getInstance().syncPersonInfo(
            { code: Int ->
              if (code != Code.REQUEST_SUCCESS) {
                promise.reject("SYNC_PERSON_FAILED", "Write failed with code $code", null)
              }
            },
            object : IPersonInfoDataListener {
              override fun onPersoninfoDataChange(status: Any?) {
                promise.resolve(null)
              }
            },
            personInfo
          )
        } catch (e: Exception) {
          promise.reject("SYNC_PERSON_FAILED", e.message, e)
        }
      }
    }

    AsyncFunction("disconnect") { promise: Promise ->
      runOnMain {
        try {
          VPOperateManager.getInstance().disconnectWatch(object : IBleWriteResponse {
            override fun onResponse(code: Int) {
              promise.resolve(null)
            }
          })
        } catch (e: Exception) {
          promise.reject("DISCONNECT_FAILED", e.message, e)
        }
      }
    }

    AsyncFunction("readSportStep") { promise: Promise ->
      runOnMain {
        try {
          VPOperateManager.getInstance().readSportStep(
            { code: Int ->
              if (code != Code.REQUEST_SUCCESS) {
                promise.reject("READ_SPORT_FAILED", "Write failed with code $code", null)
              }
            },
            object : ISportDataListener {
              override fun onSportDataChange(sportData: SportData?) {
                if (sportData != null) {
                  promise.resolve(mapOf(
                    "step" to sportData.step,
                    "dis" to sportData.dis,
                    "kcal" to sportData.kcal
                  ))
                }
              }
            }
          )
        } catch (e: Exception) {
          promise.reject("READ_SPORT_FAILED", e.message, e)
        }
      }
    }

    AsyncFunction("readBattery") { promise: Promise ->
      runOnMain {
        try {
          VPOperateManager.getInstance().readBattery(
            { code: Int ->
              if (code != Code.REQUEST_SUCCESS) {
                promise.reject("READ_BATTERY_FAILED", "Write failed with code $code", null)
              }
            },
            object : IBatteryDataListener {
              override fun onDataChange(batteryData: BatteryData?) {
                if (batteryData != null) {
                  promise.resolve(mapOf(
                    "batteryLevel" to batteryData.batteryLevel,
                    "batteryPercent" to batteryData.batteryPercent,
                    "isLowBattery" to batteryData.isLowBattery,
                    "isPercent" to batteryData.isPercent
                  ))
                }
              }
            }
          )
        } catch (e: Exception) {
          promise.reject("READ_BATTERY_FAILED", e.message, e)
        }
      }
    }
  }

  private fun runOnMain(block: () -> Unit) {
    if (Looper.myLooper() == Looper.getMainLooper()) {
      block()
    } else {
      mainHandler.post(block)
    }
  }
}
